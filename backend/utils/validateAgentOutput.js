// Validate Gemini agent responses BEFORE saving to MongoDB.

export const validateGrade = (output) => {
  const score = Number(output.score);
  if (isNaN(score) || score < 0 || score > 100) throw new Error('Invalid score from agent');
  if (typeof output.feedback !== 'string' || output.feedback.length < 1) throw new Error('Invalid feedback');
  return { score, feedback: output.feedback.slice(0, 2000), weak_areas: output.weak_areas || [] };
};

// Validate HW Generator output — { title, questions: [{ question_id, prompt, expected_answer, points }] }.
// Backfills question_id if the model omitted it and coerces points to a number.
export const validateAssignment = (output) => {
  if (!output || typeof output.title !== 'string' || !output.title.trim()) {
    throw new Error('Invalid assignment title');
  }
  if (!Array.isArray(output.questions) || output.questions.length < 1) {
    throw new Error('Invalid questions');
  }
  const questions = output.questions.map((q, i) => {
    if (!q || typeof q.prompt !== 'string' || !q.prompt.trim()) {
      throw new Error(`Question ${i + 1} is missing a prompt`);
    }
    return {
      question_id: String(q.question_id || `q${i + 1}`),
      prompt: q.prompt,
      expected_answer: typeof q.expected_answer === 'string' ? q.expected_answer : '',
      points: Number(q.points) || 0
    };
  });
  return { title: output.title.trim(), questions };
};

// Validate Study Buddy plan output — { daily_goal, plan_text, resources: [{ title, url, description }] }.
export const validateStudyPlan = (output) => {
  if (!output || typeof output.daily_goal !== 'string') throw new Error('Invalid daily_goal');
  if (typeof output.plan_text !== 'string') throw new Error('Invalid plan_text');
  const resources = Array.isArray(output.resources)
    ? output.resources.map((r) => ({
        title: String(r?.title || ''),
        url: String(r?.url || ''),
        description: String(r?.description || '')
      }))
    : [];
  return { daily_goal: output.daily_goal, plan_text: output.plan_text, resources };
};
