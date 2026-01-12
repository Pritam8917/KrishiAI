export const MANUAL_SUGGESTIONS: Record< string,{ disease_type: string; chemicals?: string[]; advice: string[]; warning: string;  } > = 
{
  /* ================= APPLE ================= */

  "Apple___Apple_scab": {
    disease_type: "Fungal",
    chemicals: ["Captan", "Sulfur-based fungicides", "Mancozeb"],
    advice: [
      "Remove and destroy infected leaves",
      "Ensure good air circulation",
      "Avoid overhead irrigation"
    ],
    warning: "Consult local agriculture experts for dosage and timing."
  },

  "Apple___Black_rot": {
    disease_type: "Fungal",
    chemicals: ["Captan", "Mancozeb"],
    advice: [
      "Prune infected branches",
      "Remove mummified fruits",
      "Maintain orchard sanitation"
    ],
    warning: "Use fungicides only after expert consultation."
  },

  "Apple___Cedar_apple_rust": {
    disease_type: "Fungal",
    chemicals: ["Myclobutanil", "Sulfur-based fungicides"],
    advice: [
      "Remove nearby juniper plants if possible",
      "Prune infected leaves"
    ],
    warning: "Follow agricultural extension guidelines."
  },

  "Apple___healthy": {
    disease_type: "Healthy",
    advice: [
      "No treatment required",
      "Maintain proper irrigation and nutrition",
      "Continue regular monitoring"
    ],
    warning: "Preventive care is recommended."
  },

  /* ================= BLUEBERRY ================= */

  "Blueberry___healthy": {
    disease_type: "Healthy",
    advice: [
      "No chemical treatment required",
      "Maintain soil acidity and proper watering"
    ],
    warning: "Healthy crop detected."
  },

  /* ================= CHERRY ================= */

  "Cherry_(including_sour)___Powdery_mildew": {
    disease_type: "Fungal",
    chemicals: ["Sulfur-based fungicides", "Myclobutanil"],
    advice: [
      "Prune affected shoots",
      "Improve air circulation"
    ],
    warning: "Consult experts before spraying."
  },

  "Cherry_(including_sour)___healthy": {
    disease_type: "Healthy",
    advice: ["No action required", "Continue regular care"],
    warning: "Healthy crop detected."
  },

  /* ================= CORN ================= */

  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    disease_type: "Fungal",
    chemicals: ["Azoxystrobin", "Propiconazole"],
    advice: [
      "Rotate crops",
      "Remove crop residues"
    ],
    warning: "Follow state agriculture guidelines."
  },

  "Corn_(maize)___Common_rust_": {
    disease_type: "Fungal",
    chemicals: ["Mancozeb", "Propiconazole"],
    advice: [
      "Use resistant varieties",
      "Avoid excess nitrogen"
    ],
    warning: "Consult experts for chemical use."
  },

  "Corn_(maize)___Northern_Leaf_Blight": {
    disease_type: "Fungal",
    chemicals: ["Azoxystrobin", "Mancozeb"],
    advice: [
      "Practice crop rotation",
      "Destroy infected residues"
    ],
    warning: "Expert consultation advised."
  },

  "Corn_(maize)___healthy": {
    disease_type: "Healthy",
    advice: ["No treatment required"],
    warning: "Healthy crop detected."
  },

  /* ================= GRAPE ================= */

  "Grape___Black_rot": {
    disease_type: "Fungal",
    chemicals: ["Mancozeb", "Myclobutanil"],
    advice: [
      "Remove infected fruits",
      "Ensure good sunlight exposure"
    ],
    warning: "Use fungicides responsibly."
  },

  "Grape___Esca_(Black_Measles)": {
    disease_type: "Fungal",
    chemicals: ["Sodium arsenite (restricted)"],
    advice: [
      "Prune infected vines",
      "Improve vineyard hygiene"
    ],
    warning: "Consult certified experts only."
  },

  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    disease_type: "Fungal",
    chemicals: ["Copper-based fungicides"],
    advice: [
      "Remove infected leaves",
      "Avoid overhead irrigation"
    ],
    warning: "Follow local recommendations."
  },

  "Grape___healthy": {
    disease_type: "Healthy",
    advice: ["No action required"],
    warning: "Healthy crop detected."
  },

  /* ================= ORANGE ================= */

  "Orange___Haunglongbing_(Citrus_greening)": {
    disease_type: "Bacterial",
    chemicals: ["Imidacloprid (vector control)"],
    advice: [
      "Remove infected plants",
      "Control psyllid vectors"
    ],
    warning: "No chemical cure exists. Expert guidance required."
  },

  /* ================= PEACH ================= */

  "Peach___Bacterial_spot": {
    disease_type: "Bacterial",
    chemicals: ["Copper-based bactericides"],
    advice: [
      "Remove infected twigs",
      "Avoid overhead irrigation"
    ],
    warning: "Consult agricultural officers."
  },

  "Peach___healthy": {
    disease_type: "Healthy",
    advice: ["Maintain orchard hygiene"],
    warning: "Healthy crop detected."
  },

  /* ================= PEPPER ================= */

  "Pepper,_bell___Bacterial_spot": {
    disease_type: "Bacterial",
    chemicals: ["Copper-based bactericides"],
    advice: [
      "Use disease-free seeds",
      "Remove infected plants"
    ],
    warning: "Follow expert guidance."
  },

  "Pepper,_bell___healthy": {
    disease_type: "Healthy",
    advice: ["No treatment required"],
    warning: "Healthy crop detected."
  },

  /* ================= POTATO ================= */

  "Potato___Early_blight": {
    disease_type: "Fungal",
    chemicals: ["Mancozeb", "Chlorothalonil"],
    advice: [
      "Remove infected leaves",
      "Practice crop rotation"
    ],
    warning: "Consult experts for fungicide use."
  },

  "Potato___Late_blight": {
    disease_type: "Fungal",
    chemicals: ["Chlorothalonil", "Mancozeb"],
    advice: [
      "Destroy infected plants",
      "Improve drainage"
    ],
    warning: "Urgent expert consultation recommended."
  },

  "Potato___healthy": {
    disease_type: "Healthy",
    advice: ["No action required"],
    warning: "Healthy crop detected."
  },

  /* ================= STRAWBERRY ================= */

  "Strawberry___Leaf_scorch": {
    disease_type: "Fungal",
    chemicals: ["Myclobutanil", "Captan"],
    advice: [
      "Remove infected leaves",
      "Improve air circulation"
    ],
    warning: "Consult agriculture experts."
  },

  "Strawberry___healthy": {
    disease_type: "Healthy",
    advice: ["No treatment required"],
    warning: "Healthy crop detected."
  },

  /* ================= TOMATO ================= */

  "Tomato___Bacterial_spot": {
    disease_type: "Bacterial",
    chemicals: ["Copper-based bactericides"],
    advice: [
      "Remove infected plants",
      "Avoid overhead watering"
    ],
    warning: "Consult agricultural experts."
  },

  "Tomato___Early_blight": {
    disease_type: "Fungal",
    chemicals: ["Mancozeb", "Chlorothalonil"],
    advice: [
      "Remove infected leaves",
      "Practice crop rotation"
    ],
    warning: "Expert guidance recommended."
  },

  "Tomato___Late_blight": {
    disease_type: "Fungal",
    chemicals: ["Chlorothalonil", "Mancozeb"],
    advice: [
      "Destroy infected plants",
      "Avoid water stagnation"
    ],
    warning: "Immediate expert consultation advised."
  },

  "Tomato___Leaf_Mold": {
    disease_type: "Fungal",
    chemicals: ["Chlorothalonil"],
    advice: [
      "Improve ventilation",
      "Reduce humidity"
    ],
    warning: "Consult experts."
  },

  "Tomato___Septoria_leaf_spot": {
    disease_type: "Fungal",
    chemicals: ["Mancozeb", "Chlorothalonil"],
    advice: [
      "Remove infected leaves",
      "Avoid overhead irrigation"
    ],
    warning: "Follow agricultural recommendations."
  },

  "Tomato___Spider_mites Two-spotted_spider_mite": {
    disease_type: "Pest",
    chemicals: ["Abamectin", "Neem-based acaricides"],
    advice: [
      "Wash leaves with water",
      "Encourage natural predators"
    ],
    warning: "Avoid excessive pesticide use."
  },

  "Tomato___Target_Spot": {
    disease_type: "Fungal",
    chemicals: ["Azoxystrobin"],
    advice: [
      "Remove infected leaves",
      "Maintain field hygiene"
    ],
    warning: "Consult experts."
  },

  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    disease_type: "Viral",
    chemicals: ["Imidacloprid (vector control)"],
    advice: [
      "Remove infected plants",
      "Control whitefly vectors"
    ],
    warning: "No chemical cure exists."
  },

  "Tomato___Tomato_mosaic_virus": {
    disease_type: "Viral",
    chemicals: [],
    advice: [
      "Remove infected plants",
      "Disinfect tools"
    ],
    warning: "No chemical treatment available."
  },

  "Tomato___healthy": {
    disease_type: "Healthy",
    advice: ["No treatment required"],
    warning: "Healthy crop detected."
  }
};
