"use client";

import React from "react";

export default function StepExperience({ formData, setFormData }) {
  const pastWork = formData.pastWork || [];
  const education = formData.education || [];

  // Work handlers
  const handleAddWork = () => {
    setFormData((prev) => ({
      ...prev,
      pastWork: [...(prev.pastWork || []), { company: "", position: "", years: "" }],
    }));
  };

  const handleRemoveWork = (index) => {
    setFormData((prev) => ({
      ...prev,
      pastWork: prev.pastWork.filter((_, idx) => idx !== index),
    }));
  };

  const handleWorkChange = (index, field, value) => {
    const updated = [...pastWork];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, pastWork: updated }));
  };

  // Education handlers
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { school: "", degree: "", fieldOfStudy: "" },
      ],
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 4 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
          Experience & Education
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Share your past software projects, companies, or universities. (Optional — can also be updated later)
        </p>
      </div>

      <div className="space-y-6 max-h-[360px] overflow-y-auto pr-1">
        {/* Work Experience Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <i className="fa-solid fa-briefcase text-emerald-400 text-xs"></i>
              Work & Internship Experience
            </h3>
            <button
              type="button"
              onClick={handleAddWork}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Add Experience
            </button>
          </div>

          {pastWork.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center bg-zinc-950/30">
              <p className="text-xs text-zinc-500">
                No work experience added yet. Click &quot;+ Add Experience&quot; to include past roles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastWork.map((work, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 relative group space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                      Experience #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWork(idx)}
                      className="text-zinc-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={work.company || ""}
                      onChange={(e) =>
                        handleWorkChange(idx, "company", e.target.value)
                      }
                      placeholder="Company / Organization"
                      className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                    />
                    <input
                      type="text"
                      value={work.position || ""}
                      onChange={(e) =>
                        handleWorkChange(idx, "position", e.target.value)
                      }
                      placeholder="Position (e.g. Frontend Developer)"
                      className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <input
                    type="text"
                    value={work.years || ""}
                    onChange={(e) =>
                      handleWorkChange(idx, "years", e.target.value)
                    }
                    placeholder="Duration / Years (e.g. 2022 - 2024 or 1 year)"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <i className="fa-solid fa-graduation-cap text-emerald-400 text-xs"></i>
              Education & Degrees
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Add Education
            </button>
          </div>

          {education.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center bg-zinc-950/30">
              <p className="text-xs text-zinc-500">
                No education details added yet. Click &quot;+ Add Education&quot; to include your school/degree.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 relative group space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                      Education #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-zinc-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={edu.school || ""}
                    onChange={(e) =>
                      handleEducationChange(idx, "school", e.target.value)
                    }
                    placeholder="School / University / Bootcamp"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) =>
                        handleEducationChange(idx, "degree", e.target.value)
                      }
                      placeholder="Degree (e.g. B.S., Master's)"
                      className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                    />
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ""}
                      onChange={(e) =>
                        handleEducationChange(idx, "fieldOfStudy", e.target.value)
                      }
                      placeholder="Field of Study (e.g. Computer Science)"
                      className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
