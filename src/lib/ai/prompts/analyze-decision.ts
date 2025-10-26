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

FORMAT REQUIREMENTS - Return this as well-structured markdown:
- **Primary structure**: Use bullet points (- or *) to list each distinct alternative
- **Emphasis**: Use **bold** for the main alternative name or key action at the start of each bullet
- **Detail**: After the bolded alternative name, provide 1-2 sentences of explanation
- **Organization**: Group related alternatives together, with a blank line between groups
- **Prioritization**: If alternatives have clear priority levels, use numbered lists (1., 2., 3.)
- **Clarity**: Break up long lists - add blank lines between major alternatives for better readability
- **Formatting**: Use _italic_ for subtle nuances or caveats (e.g., _"though this may require..."_)
- **NO HEADERS**: Do not use headings (# or ##) - rely on bold text and structure instead

EXAMPLE STRUCTURE:
- **Alternative Name**: Brief explanation of what this option entails and why it's worth considering.

- **Another Option**: Description of this path and its potential benefits.

1. **Prioritized Option A**: If showing priority, use numbered lists with bold names.
2. **Prioritized Option B**: Each with clear explanations.
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

FORMAT REQUIREMENTS - Return this as well-structured markdown:
- **Primary structure**: Use bullet points to organize distinct insights
- **Category labels**: Start each major insight with **bold text** that summarizes the insight category
- **Detail**: Follow the bold label with explanation or examples
- **Mixed content**: Combine standalone bullet points with short paragraphs where appropriate
- **Emphasis hierarchy**:
  - **Bold** for key insights, strengths, or areas for growth
  - _Italic_ for subtle observations, nuances, or qualifying statements
- **Nested insights**: Use sub-bullets (indented) when you have supporting points
- **Readability**: Add blank lines between major insight groups for visual breathing room
- **Actionability**: When suggesting improvements, be specific and constructive
- **NO HEADERS**: Do not use headings (# or ##) - rely on bold text and list structure

EXAMPLE STRUCTURE:
**Decision-making pattern observed**: Brief explanation of the pattern you noticed.

**Key strength**: What they did well in their process, with specific examples.

- **Area for growth**: Constructive suggestion with practical guidance
  - Supporting point or specific example
  - Another supporting detail

**Additional observation**: _Subtle nuance or contextual insight that adds depth._
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
};
