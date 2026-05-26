// The platform is built for a single college — DYP DPU.
// This controller returns the static college data.
// If you expand to multiple colleges later, replace this with a DB model.

const COLLEGE = {
  id: "dyp-dpu",
  name: "Dr. D. Y. Patil Institute of Technology",
  shortName: "DYP DPU",
  city: "Pune",
  address: "Sant Tukaram Nagar, Pimpri Colony, Pune, Pimpri-Chinchwad",
  students: 3200,
  featured: true,
  departments: [
    "Computer Engineering",
    "Information Technology",
    "Electronics & Telecommunication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "AIDS (AI & Data Science)",
    "AIML (AI & Machine Learning)",
  ],
  semesters: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"],
};

// ── GET /api/colleges ─────────────────────────────────────────────────────────
export const getColleges = (req, res) => {
  res.status(200).json({ colleges: [COLLEGE] });
};

// ── GET /api/colleges/:id ─────────────────────────────────────────────────────
export const getCollegeById = (req, res) => {
  if (req.params.id !== "dyp-dpu") {
    return res.status(404).json({ message: "College not found" });
  }
  res.status(200).json({ college: COLLEGE });
};
