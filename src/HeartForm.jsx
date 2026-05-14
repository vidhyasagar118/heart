// ==========================
// HeartForm.jsx (FULL FIXED)
// ==========================

import React, { useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./HeartForm.css";

const HeartForm = () => {

  const reportRef = useRef();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    age: 40,
    gender: 1,
    chestpain: 0,
    restingBP: 120,
    serumcholestrol: 180,
    fastingbloodsugar: 0,
    restingrelectro: 0,
    maxheartrate: 150,
    exerciseangia: 0,
    oldpeak: 0,
    slope: 1,
    noofmajorvessels: 0,
  });

  const [result, setResult] = useState(null);

  // ==========================
  // WARNING MESSAGE
  // ==========================

  const getWarningMessage = () => {

    if (!result) return "";

    const prob = Number(result.risk_probability ?? 0);

    if (prob >= 80)
      return "🚨 Critical Risk Detected! Immediate medical attention is strongly recommended.";

    if (prob >= 60)
      return "⚠️ High heart disease risk detected. Please consult a cardiologist soon.";

    if (prob >= 40)
      return "🩺 Moderate risk detected. Maintain a healthy diet and regular exercise.";

    if (prob >= 20)
      return "💡 Mild risk detected. Regular health checkups are recommended.";

    return "✅ Low risk detected. Keep maintaining a healthy lifestyle.";
  };

  // ==========================
  // PRECAUTIONS
  // ==========================

  const getPrecautions = () => {

    if (!result) return [];

    const prob = Number(result.risk_probability ?? 0);

    if (prob >= 80)
      return [
        "Immediately consult a cardiologist",
        "Avoid heavy physical activities",
        "Monitor blood pressure daily",
        "Take prescribed medications regularly",
        "Avoid smoking and alcohol",
        "Maintain emergency medical support access",
      ];

    if (prob >= 60)
      return [
        "Schedule a full cardiac checkup",
        "Walk 20-30 minutes daily",
        "Reduce stress and anxiety",
        "Limit salt and oily foods",
        "Monitor cholesterol regularly",
        "Sleep at least 7 hours daily",
      ];

    if (prob >= 40)
      return [
        "Exercise regularly",
        "Reduce junk food intake",
        "Drink more water",
        "Practice yoga or meditation",
        "Avoid excessive sugar",
        "Maintain healthy body weight",
      ];

    if (prob >= 20)
      return [
        "Continue regular health checkups",
        "Maintain active lifestyle",
        "Sleep properly",
        "Avoid stress",
        "Drink enough water",
      ];

    return [
      "Maintain healthy lifestyle",
      "Exercise regularly",
      "Eat balanced diet",
      "Stay hydrated",
      "Continue annual health checkups",
    ];
  };

  // ==========================
  // DIET RECOMMENDATIONS
  // ==========================

  const getDietRecommendations = () => {

    if (!result) return [];

    const prob = Number(result.risk_probability ?? 0);

    if (prob >= 80)
      return [
        "Strict low-fat diet",
        "Avoid fried and processed foods",
        "Eat oats and high-fiber foods",
        "Consume green vegetables daily",
        "Avoid sugary drinks",
        "Reduce sodium intake",
      ];

    if (prob >= 60)
      return [
        "Increase fruits and vegetables",
        "Eat lean protein foods",
        "Reduce red meat consumption",
        "Use olive oil instead of butter",
        "Drink green tea",
        "Limit fast food",
      ];

    if (prob >= 40)
      return [
        "Balanced homemade meals",
        "Add fruits to breakfast",
        "Avoid cold drinks",
        "Increase protein intake",
        "Reduce oily snacks",
        "Drink 2-3 liters water daily",
      ];

    if (prob >= 20)
      return [
        "Maintain balanced diet",
        "Eat seasonal fruits",
        "Avoid overeating",
        "Drink enough water",
        "Limit sugar intake",
      ];

    return [
      "Continue healthy eating habits",
      "Eat fresh vegetables",
      "Maintain proper hydration",
      "Avoid junk food",
      "Include fiber-rich foods",
    ];
  };

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "patientName"
          ? value
          : Number(value),
    });
  };

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await axios.post(
        "http://127.0.0.1:5000/predict",
        {
          age: formData.age,
          gender: formData.gender,
          chestpain: formData.chestpain,
          restingBP: formData.restingBP,
          serumcholestrol: formData.serumcholestrol,
          fastingbloodsugar: formData.fastingbloodsugar,
          restingrelectro: formData.restingrelectro,
          maxheartrate: formData.maxheartrate,
          exerciseangia: formData.exerciseangia,
          oldpeak: formData.oldpeak,
          slope: formData.slope,
        }
      );

      console.log("API Response:", res.data);

      setResult({
        prediction: res.data.risk_category,
        risk_probability: Number(
          res.data.risk_percentage
        ).toFixed(2),
        safe_probability: (
          100 - res.data.risk_percentage
        ).toFixed(2),
      });

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);
    }
  };

  // ==========================
  // DOWNLOAD PDF
  // ==========================

  const downloadPDF = async () => {

    const input = reportRef.current;

    input.style.display = "block";

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pageHeight = 295;

    const imgWidth = 210;

    const imgHeight =
      (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pageHeight;

    while (heightLeft > 0) {

      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;
    }

    input.style.display = "none";

    pdf.save("CardioAI_Report.pdf");
  };

  return (

    <div className="main-container">

      <div className="glass-card">

        <h1>
          <img
            src="/heart.gif"
            height={"80px"}
            width={"80px"}
            alt="heart"
          />

          Heart Disease Prediction 🫀
        </h1>

        <p className="subtitle">
          Fill patient details and symptoms below
        </p>

        <div className="divider"></div>

        <h2>👤 Patient Information</h2>

        <form onSubmit={handleSubmit}>

          <div className="grid">

            <div className="input-group">

              <label>Patient Name</label>

              <input
                type="text"
                name="patientName"
                placeholder="Enter patient name"
                value={formData.patientName}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">

              <label>Age</label>

              <input
                type="range"
                min="20"
                max="90"
                value={formData.age}
                name="age"
                onChange={handleChange}
              />

              <span>{formData.age}</span>
            </div>

            <div className="input-group">

              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="1">Male</option>
                <option value="0">Female</option>
              </select>
            </div>

            <div className="input-group">

              <label>Chest Pain Type</label>

              <select
                name="chestpain"
                value={formData.chestpain}
                onChange={handleChange}
              >
                <option value="0">Typical Angina</option>
                <option value="1">Atypical Angina</option>
                <option value="2">Non-Anginal Pain</option>
                <option value="3">Asymptomatic</option>
              </select>
            </div>

            <div className="input-group">

              <label>Blood Pressure (mmHg)</label>

              <input
                type="number"
                name="restingBP"
                min="80"
                max="200"
                value={formData.restingBP}
                onChange={handleChange}
              />

              <small>
                Normal: 90–120 | High: &gt;140
              </small>
            </div>

            <div className="input-group">

              <label>Cholesterol (mg/dL)</label>

              <input
                type="number"
                name="serumcholestrol"
                min="100"
                max="400"
                value={formData.serumcholestrol}
                onChange={handleChange}
              />

              <small>
                Normal: &lt;200 | Borderline: 200–239 | High: ≥240
              </small>
            </div>

            <div className="input-group">

              <label>Blood Sugar (Fasting)</label>

              <select
                name="fastingbloodsugar"
                value={formData.fastingbloodsugar}
                onChange={handleChange}
              >
                <option value="0">
                  Normal (≤ 120 mg/dL)
                </option>

                <option value="1">
                  High (&gt; 120 mg/dL)
                </option>
              </select>
            </div>

            <div className="input-group">

              <label>ECG Result</label>

              <select
                name="restingrelectro"
                value={formData.restingrelectro}
                onChange={handleChange}
              >
                <option value="0">Normal</option>

                <option value="1">
                  ST-T Wave Abnormality
                </option>

                <option value="2">
                  Left Ventricular Hypertrophy
                </option>
              </select>
            </div>

            <div className="input-group">

              <label>Heart Rate</label>

              <input
                type="number"
                name="maxheartrate"
                value={formData.maxheartrate}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">

              <label>Exercise Angina</label>

              <select
                name="exerciseangia"
                value={formData.exerciseangia}
                onChange={handleChange}
              >
                <option value="0">No</option>

                <option value="1">Yes</option>
              </select>
            </div>

            <div className="input-group">

              <label>Old Peak (ST Depression)</label>

              <input
                type="number"
                step="0.1"
                min="0"
                max="6"
                name="oldpeak"
                value={formData.oldpeak}
                onChange={handleChange}
              />

              <small>
                High Risk: &gt; 2.0
              </small>
            </div>

            <div className="input-group">

              <label>Slope</label>

              <select
                name="slope"
                value={formData.slope}
                onChange={handleChange}
              >
                <option value="0">
                  Upsloping (Normal)
                </option>

                <option value="1">
                  Flat (Warning)
                </option>

                <option value="2">
                  Downsloping (High Risk)
                </option>
              </select>
            </div>

            <div className="input-group">

              <label>Major Vessels</label>

              <input
                type="number"
                name="noofmajorvessels"
                value={formData.noofmajorvessels}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className={`predict-btn ${
              loading ? "loading" : ""
            }`}
          >
            {loading
              ? "Analyzing..."
              : "🩺 Run Prediction"}
          </button>
        </form>

        {result && (
          <>

            <div className="result-box show">

              <h2 className="result-title">
                🩺 Prediction Result
              </h2>

              <div className="top-result-grid">

                <div className="result-card big-card">

                  <p className="patient-name">
                    👤{" "}
                    {formData.patientName ||
                      "Unknown Patient"}
                  </p>

                  <p className="detect-text">
                    DETECTED CONDITION
                  </p>

                  <h1 className="disease-name">
                    {result.prediction}
                  </h1>

                  <p className="confidence">

                    Risk :

                    <span>
                      {" "}
                      {Number(
                        result?.risk_probability ?? 0
                      ).toFixed(2)}%
                    </span>
                  </p>
                </div>

                <div className="gauge-card">

                  <div className="gauge-circle">

                    <div
                      className="gauge-fill"
                      style={{
                        background: `conic-gradient(
                          #2563eb ${
                            Number(
                              result?.risk_probability ?? 0
                            ) * 3.6
                          }deg,
                          #1e293b 0deg
                        )`,
                      }}
                    >
                      <div className="gauge-inner">

                        <h2>
                          {Number(
                            result?.risk_probability ?? 0
                          ).toFixed(2)}%
                        </h2>

                        <p>Risk</p>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="warning-box">
                {getWarningMessage()}
              </div>

              <button
                className="download-btn"
                onClick={downloadPDF}
              >
                📄 Download Report
              </button>
            </div>

            <div
              className="pdf-report"
              ref={reportRef}
              style={{ display: "none" }}
            >

              <div className="pdf-header">

                <h1>
                  CardioAI - Heart Disease Detection Report
                </h1>

                <p>
                  AI-Powered Cardiac Health Assessment
                </p>
              </div>

              <div className="pdf-body">

                <p className="date">
                  Generated on:{" "}
                  {new Date().toLocaleString()}
                </p>

                <div className="section">

                  <h3>Patient Information</h3>

                  <table>

                    <tbody>

                      <tr>
                        <td>Patient Name</td>

                        <td>
                          {formData.patientName || "N/A"}
                        </td>
                      </tr>

                      <tr>
                        <td>Age</td>

                        <td>{formData.age} years</td>
                      </tr>

                      <tr>
                        <td>Gender</td>

                        <td>
                          {formData.gender === 1
                            ? "Male"
                            : "Female"}
                        </td>
                      </tr>

                      <tr>
                        <td>Blood Pressure</td>

                        <td>
                          {formData.restingBP} mmHg
                        </td>
                      </tr>

                      <tr>
                        <td>Cholesterol</td>

                        <td>
                          {formData.serumcholestrol} mg/dL
                        </td>
                      </tr>

                      <tr>
                        <td>Heart Rate</td>

                        <td>
                          {formData.maxheartrate} bpm
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="section">

                  <h3>Prediction Result</h3>

                  <table>

                    <tbody>

                      <tr>
                        <td>Detected Condition</td>

                        <td>
                          {result.prediction}
                        </td>
                      </tr>

                      <tr>
                        <td>Risk Percentage</td>

                        <td>
                          {Number(
                            result.risk_probability
                          ).toFixed(2)}%
                        </td>
                      </tr>

                      <tr>
                        <td>Safe Percentage</td>

                        <td>
                          {Number(
                            result.safe_probability
                          ).toFixed(2)}%
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="section">

                  <h3>Symptoms Inputs</h3>

                  <ul>

                    <li>
                      Chest Pain :
                      {
                        [
                          "Typical Angina",
                          "Atypical Angina",
                          "Non-Anginal Pain",
                          "Asymptomatic",
                        ][formData.chestpain]
                      }
                    </li>

                    <li>
                      Exercise Angina :
                      {formData.exerciseangia === 1
                        ? " Yes"
                        : " No"}
                    </li>

                    <li>
                      High BP :
                      {formData.restingBP > 140
                        ? " Yes"
                        : " No"}
                      ({formData.restingBP} mmHg)
                    </li>

                    <li>
                      High Cholesterol :
                      {formData.serumcholestrol > 200
                        ? " Yes"
                        : " No"}
                      ({formData.serumcholestrol} mg/dL)
                    </li>

                  </ul>
                </div>

                <div className="section">

                  <h3>Precautions</h3>

                  <ul>

                    {getPrecautions().map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>
                </div>

                <div className="section">

                  <h3>Diet Recommendations</h3>

                  <ul>

                    {getDietRecommendations().map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>
                </div>

                <div className="footer-note">

                  DISCLAIMER: This report is generated by AI
                  and is for informational purposes only.
                  Please consult a qualified cardiologist
                  for proper diagnosis and treatment.

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeartForm;