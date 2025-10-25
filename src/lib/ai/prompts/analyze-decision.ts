/**
 * Prompt template for analyzing user decisions
 * Designed to extract decision category, cognitive biases, and insights
 */

interface DecisionInput {
  situation: string;
  decision: string;
  reasoning?: string | null;
}

export function createAnalysisPrompt(input: DecisionInput): string {
  const { situation, decision, reasoning } = input;

  return `<role>
You are an expert decision analyst specializing in cognitive psychology and behavioral economics. Your task is to deeply analyze a person's decision-making process to help them reflect and grow in self-awareness.
</role>

<decision_context>
<situation>
${situation}
</situation>

<decision_made>
${decision}
</decision_made>

${reasoning ? `<reasoning_provided>\n${reasoning}\n</reasoning_provided>` : ''}
</decision_context>

<task>
Provide a comprehensive analysis of this decision by completing the following four components:

<component_1>
<name>Category Classification</name>
<instruction>
Determine the primary decision-making style used. Choose the single best-fit category from the options below.
</instruction>
<category_options>
- EMOTIONAL: Driven primarily by feelings and emotional responses
- STRATEGIC: Carefully planned with long-term goals in mind
- IMPULSIVE: Made quickly without thorough consideration
- ANALYTICAL: Based on data, facts, and logical reasoning
- INTUITIVE: Based on gut feeling or instinct
- COLLABORATIVE: Made with input from others or considering group dynamics
- RISK_AVERSE: Focused on minimizing potential losses or dangers
- RISK_TAKING: Willing to embrace uncertainty for potential gains
- OTHER: Doesn't fit the above categories
</category_options>
</component_1>

<component_2>
<name>Cognitive Biases</name>
<instruction>
Identify 0-5 cognitive biases that may have influenced this decision. Only include biases where you see clear evidence in the decision context.
</instruction>
<bias_examples>
- Confirmation Bias: Seeking information that confirms existing beliefs
- Anchoring Bias: Over-relying on the first piece of information
- Availability Heuristic: Overweighting recent or easily recalled information
- Sunk Cost Fallacy: Continuing based on past investment rather than future value
- Overconfidence Bias: Overestimating one's knowledge or abilities
- Status Quo Bias: Preferring things to stay the same
- Loss Aversion: Fearing losses more than valuing equivalent gains
- Optimism Bias: Overestimating positive outcomes
- Recency Bias: Overweighting recent events
- Hindsight Bias: Believing past events were predictable
- And other relevant cognitive biases
</bias_examples>
</component_2>

<component_3>
<name>Overlooked Alternatives</name>
<instruction>
Thoughtfully explore what other options, perspectives, or paths might have been available but weren't considered. Be specific, constructive, and evidence-based.
</instruction>
</component_3>

<component_4>
<name>Insights</name>
<instruction>
Provide additional observations about the decision-making process, including:
- Patterns in the decision-making approach
- Strengths of the decision-making process
- Potential areas for growth or awareness
- Any nuanced observations about the decision context
</instruction>
</component_4>
</task>

<guidelines>
- Be respectful and constructive in your analysis
- Focus on the decision-making process, not on judging the decision outcome
- Be specific and evidence-based when identifying biases
- Provide actionable insights that could help improve future decisions
- If no clear biases are present, return an empty array for the biases field
- Use clear, accessible language that helps the person learn
- Ground all observations in the specific details provided in the decision context
</guidelines>`;
}
