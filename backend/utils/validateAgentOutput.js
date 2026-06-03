// Validate Gemini agent responses BEFORE saving to MongoDB.

export const validateGrade = (output) => {
  const score = Number(output.score);
  if (isNaN(score) || score < 0 || score > 100) throw new Error('Invalid score from agent');
  if (typeof output.feedback !== 'string' || output.feedback.length < 1) throw new Error('Invalid feedback');
  return { score, feedback: output.feedback.slice(0, 2000), weak_areas: output.weak_areas || [] };
};

// TODO: validate HW Generator output — expect { title, questions: [...] } with 5 questions,
// each having question_id, prompt, expected_answer, points.
export const validateAssignment = (output) => {
  if (!output || typeof output.title !== 'string') throw new Error('Invalid assignment title');
  if (!Array.isArray(output.questions) || output.questions.length < 1) throw new Error('Invalid questions');
  // TODO: per-question field checks
  return output;
};

// TODO: validate Study Buddy plan output — expect { daily_goal, plan_text, resources: [...] }.
export const validateStudyPlan = (output) => {
  if (!output || typeof output.daily_goal !== 'string') throw new Error('Invalid daily_goal');
  if (typeof output.plan_text !== 'string') throw new Error('Invalid plan_text');
  return { ...output, resources: output.resources || [] };
};
