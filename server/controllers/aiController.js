const { sendSMS } = require("../utils/sendSMS");

const HealthLog = require('../models/HealthLog');
const Patient = require('../models/Patient');

// We use the built-in fetch or axios for OpenRouter.
const analyzeText = async (req, res) => {
  try {
    const { text, medicationTaken } = req.body;
    const patientId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    let summary = '';
    let risk = 'LOW';
    let confidence = 80;
    let issues = [];
    let recommendation = '';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI medical assistant evaluating a patient's transcript. 
Extract symptoms, emotional tone, and medication adherence. The patient may speak in English or Hindi (Romanized or Devanagari). Translate Hindi internally.
Return ONLY valid JSON with this structure:
{
  "summary": "Short summary of patient status",
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "confidence": 0-100,
  "issues": ["issue 1", "issue 2"],
  "recommendation": "Short recommendation"
}
Rule for risk: HIGH if mentions pain, blood, khoon, severe breathing issues, emergency, or fever. MEDIUM if mild discomfort or if they skipped medication.
The patient indicated whether they took their medication today: ${medicationTaken ? 'YES' : 'NO'}.`
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      });

      const aiData = await response.json();

      if (aiData.choices && aiData.choices.length > 0) {
        const content = aiData.choices[0].message.content;
        const cleaned = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        summary = parsed.summary || 'Analyzed patient input.';
        risk = parsed.risk || 'LOW';
        confidence = parsed.confidence || 80;
        issues = parsed.issues || [];
        recommendation = parsed.recommendation || '';
      } else {
        throw new Error('Invalid OpenRouter response');
      }

    } catch (aiErr) {
      console.error('AI API Error:', aiErr.message);

      summary = 'Patient reported status: ' + text.substring(0, 50) + '...';
      const lowerText = text.toLowerCase();

      if (
        lowerText.includes('pain') ||
        lowerText.includes('blood') ||
        lowerText.includes('khoon') ||
        lowerText.includes('chakkar') ||
        lowerText.includes('breath') ||
        lowerText.includes('emergency') ||
        lowerText.includes('die') ||
        lowerText.includes('suicide')
      ) {
        risk = 'HIGH';
        issues = ['Reported critical symptoms'];
        recommendation = 'Immediate attention required';
      } else if (!medicationTaken || lowerText.includes('didnt') || lowerText.includes('not taken')) {
        risk = 'MEDIUM';
        issues = ['Missed medication'];
        recommendation = 'Please take your prescribed medication';
      } else {
        risk = 'LOW';
        recommendation = 'Monitor condition';
      }
    }

    const log = await HealthLog.create({
      patientId,
      transcript: text,
      summary,
      risk,
      confidence,
      issues,
      recommendation
    });

    const patient = await Patient.findById(patientId).populate('doctorId');
    const doctorId = patient.doctorId._id.toString();

    if (req.app.get('io')) {
      const io = req.app.get('io');

      io.to(doctorId).emit('new-health-log', {
        log,
        patientName: patient.name,
        patientId: patient._id
      });

      if (risk === 'HIGH') {
        io.to(doctorId).emit('alert', {
          message: `HIGH RISK ALERT for ${patient.name}`,
          patientId: patient._id
        });
      }
    }

    if (risk === 'HIGH') {
      try {
        if (patient.guardianPhoneNumber) {
          const guardianNumber = "+91" + patient.guardianPhoneNumber;

          await sendSMS(
            guardianNumber,
            `⚠️ ALERT: ${patient.name} is at HIGH risk.\nMessage: ${text}`
          );

          console.log(`✅ SMS sent to guardian: ${guardianNumber}`);
        } else {
          console.log("⚠️ No guardian phone number found");
        }
      } catch (smsErr) {
        console.error("❌ SMS Error:", smsErr.message);
      }
    }

    res.status(201).json(log);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { analyzeText };