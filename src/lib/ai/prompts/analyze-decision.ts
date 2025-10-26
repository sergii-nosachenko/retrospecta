/**
 * Prompt template for analyzing user decisions
 * Designed to extract decision category, cognitive biases, and insights
 */
import { CognitiveBias, DecisionType } from '@/types/enums';

interface DecisionInput {
  situation: string;
  decision: string;
  reasoning?: string | null;
}

const availableBiasesDescriptions: Record<CognitiveBias, string> = {
  [CognitiveBias.CONFIRMATION_BIAS]:
    'Seeking information that confirms existing beliefs',
  [CognitiveBias.ANCHORING_BIAS]:
    'Over-relying on the first piece of information',
  [CognitiveBias.AVAILABILITY_HEURISTIC]:
    'Overweighting recent or easily recalled information',
  [CognitiveBias.SUNK_COST_FALLACY]:
    'Continuing based on past investment rather than future value',
  [CognitiveBias.RECENCY_BIAS]: 'Overweighting recent events',
  [CognitiveBias.OVERCONFIDENCE_BIAS]:
    "Overestimating one's knowledge or abilities",
  [CognitiveBias.HINDSIGHT_BIAS]: 'Believing past events were predictable',
  [CognitiveBias.STATUS_QUO_BIAS]: 'Preferring things to stay the same',
  [CognitiveBias.LOSS_AVERSION]:
    'Fearing losses more than valuing equivalent gains',
  [CognitiveBias.FRAMING_EFFECT]:
    'Being influenced by how information is presented',
  [CognitiveBias.GROUPTHINK]:
    'Conforming to group consensus without critical evaluation',
  [CognitiveBias.AUTHORITY_BIAS]:
    'Over-trusting information from authority figures',
  [CognitiveBias.BANDWAGON_EFFECT]: 'Adopting beliefs because many others do',
  [CognitiveBias.DUNNING_KRUGER_EFFECT]:
    'Overestimating competence in areas of low ability',
  [CognitiveBias.OPTIMISM_BIAS]: 'Overestimating positive outcomes',
  [CognitiveBias.NEGATIVITY_BIAS]: 'Giving more weight to negative experiences',
  [CognitiveBias.FUNDAMENTAL_ATTRIBUTION_ERROR]:
    'Overemphasizing personality-based explanations while underemphasizing situational factors',
};

const decisionCategoryDescriptions: Record<DecisionType, string> = {
  [DecisionType.EMOTIONAL]:
    'Driven primarily by feelings and emotional responses',
  [DecisionType.STRATEGIC]: 'Carefully planned with long-term goals in mind',
  [DecisionType.IMPULSIVE]: 'Made quickly without thorough consideration',
  [DecisionType.ANALYTICAL]: 'Based on data, facts, and logical reasoning',
  [DecisionType.INTUITIVE]: 'Based on gut feeling or instinct',
  [DecisionType.COLLABORATIVE]:
    'Made with input from others or considering group dynamics',
  [DecisionType.RISK_AVERSE]:
    'Focused on minimizing potential losses or dangers',
  [DecisionType.RISK_TAKING]:
    'Willing to embrace uncertainty for potential gains',
  [DecisionType.OTHER]: "Doesn't fit the above categories",
};

const buildList = (items: [string, string][]): string => {
  return items
    .map(([key, description]) => `- ${key}: ${description}`)
    .join('\n');
};

export const createAnalysisPrompt = (input: DecisionInput): string => {
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
<decision_category_options>
${buildList(Object.entries(decisionCategoryDescriptions))}
</decision_category_options>
</component_1>

<component_2>
<name>Cognitive Biases</name>
<instruction>
Identify 0-5 cognitive biases that may have influenced this decision. Only include biases where you see clear evidence in the decision context. Return the bias names exactly as listed below (e.g., "CONFIRMATION_BIAS" not "Confirmation Bias").
</instruction>
<available_biases>
${buildList(Object.entries(availableBiasesDescriptions))}
</available_biases>
</component_2>

<component_3>
<name>Overlooked Alternatives</name>
<instruction>
Thoughtfully explore what other options, perspectives, or paths might have been available but weren't considered. Be specific, constructive, and evidence-based.

FORMAT REQUIREMENTS:
Return markdown text with a blank line (two newlines: \\n\\n) between each bullet point.

Structure:
- **Bold alternative name** at the start of each bullet
- Explanation after the name
- Blank line before the next bullet
- Use _italic_ for nuances

REQUIRED OUTPUT PATTERN - Follow this exact spacing:
\`\`\`
- **First Alternative**: Explanation here.

- **Second Alternative**: Another explanation here.

- **Third Alternative**: Final alternative with details.
\`\`\`

For numbered lists, use the same blank line pattern:
\`\`\`
1. **First Option**: Explanation.

2. **Second Option**: Another explanation.

3. **Third Option**: Final option.
\`\`\`
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

FORMAT REQUIREMENTS:
Return markdown text with a blank line (two newlines: \\n\\n) between each major insight.

Structure:
- Start insights with **bold text** summarizing the category
- Follow with explanation or examples
- Use _italic_ for subtle observations
- Add blank line before the next insight
- Use sub-bullets for supporting details when needed

REQUIRED OUTPUT PATTERN - Follow this exact spacing:
\`\`\`
**Decision-making pattern**: Brief explanation of the pattern.

**Key strength**: What they did well with examples.

**Area for growth**: Constructive suggestion here.

**Additional observation**: _Subtle nuance or insight._
\`\`\`

For insights with sub-bullets:
\`\`\`
**Main insight**: Primary explanation here.

- **Supporting point A**: Detail about this aspect.
  - Nested detail if needed
  - Another nested point

**Next insight**: Continue with proper spacing.
\`\`\`
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
</guidelines>

<formatting_critical>
CRITICAL FORMATTING RULE:
Your "alternatives" and "insights" outputs MUST include a blank line between each bullet point or major element.
Follow the code block examples exactly - they show the required spacing with actual blank lines.
Without these blank lines, the markdown will not render correctly.
</formatting_critical>`;
};
