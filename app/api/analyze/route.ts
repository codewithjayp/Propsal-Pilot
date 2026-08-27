import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { proposal } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const USER_ID = user.id;

    const { data: subscriptions, error: subscriptionError } =
      await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", USER_ID);

    if (subscriptionError) {
      return NextResponse.json(
        {
          error: subscriptionError.message,
        },
        {
          status: 500,
        }
      );
    }

    const subscription = subscriptions?.[0];

    if (!subscription) {
      return NextResponse.json(
        {
          error: "Subscription not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      subscription.reviews_used >=
      subscription.review_limit
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have reached your free review limit. Please upgrade to Pro.",
        },
        {
          status: 403,
        }
      );
    }

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_completion_tokens: 1500,
        messages: [
          {
            role: "system",
            content: `
ROLE:
You are ProposalPilot AI, a senior proposal review consultant with expertise in business proposals, startup pitches, grant proposals, government tenders, academic proposals, freelance project proposals, and technical project proposals.

TASK:
Analyze the user's proposal and provide a detailed professional review.

CONSTRAINTS:
1. Review only the proposal content provided by the user.
2. Do not invent information that is not present in the proposal.
3. Be objective, constructive, and professional.
4. Identify both strengths and weaknesses.
5. Provide actionable recommendations.
6. Evaluate clarity, completeness, feasibility, budget, timeline, risks, deliverables, and overall professionalism.
7. If any important section is missing, explicitly mention it.
8. Keep feedback specific and practical.
9. Do not generate code unless the proposal explicitly requests software implementation details.

OUTPUT FORMAT:

# Proposal Summary
Provide a concise summary of the proposal.

# Overall Score
Give a score out of 10.

# Strengths
- Point 1
- Point 2
- Point 3

# Weaknesses
- Point 1
- Point 2
- Point 3

# Missing Information
List any important missing details.

# Risk Assessment
Explain potential risks and concerns.

# Improvement Suggestions
Provide specific recommendations.

# Final Verdict
Choose one:
- Excellent
- Good
- Needs Improvement
- Weak

FEW-SHOT EXAMPLE:

User Proposal:
We want to develop an AI-powered traffic management system for smart cities. Budget £50,000. Timeline 6 months.

Expected Review Style:

# Proposal Summary
AI-powered traffic monitoring and signal optimization system for urban traffic management.

# Overall Score
8/10

# Strengths
- Clear objective
- Defined budget
- Real-world use case

# Weaknesses
- Missing technical architecture
- No risk mitigation plan

# Missing Information
- Team structure
- Success metrics

# Risk Assessment
Potential integration challenges with existing traffic infrastructure.

# Improvement Suggestions
Add implementation phases, KPIs, and maintenance strategy.

# Final Verdict
Good

FALLBACK RULE:

If the user's input is not a proposal, project pitch, business plan, tender, grant application, startup idea, academic proposal, freelance proposal, or project description, respond exactly with:

This content does not appear to be a proposal. Please submit a proposal, project plan, business pitch, grant application, or project description for analysis.
`,
          },
          {
            role: "user",
            content: proposal
          },
        ],
      });

    const review =
      completion.choices[0]?.message?.content ||
      "No review generated.";

    const {
      data: savedReview,
      error: saveError,
    } = await supabase
      .from("proposal_reviews")
      .insert([
        {
          user_id: USER_ID,
          project_description: proposal,
          proposal: review,
        },
      ])
      .select();

    console.log(
      "SAVED REVIEW:",
      savedReview
    );

    console.log(
      "SAVE ERROR:",
      saveError
    );

    if (saveError) {
      return NextResponse.json(
        {
          error: saveError.message,
        },
        {
          status: 500,
        }
      );
    }

    const newReviewCount =
      subscription.reviews_used + 1;

    const {
      data: updatedSubscription,
      error: updateError,
    } = await supabase
      .from("subscriptions")
      .update({
        reviews_used: newReviewCount,
      })
      .eq("user_id", USER_ID)
      .select();

    console.log(
      "UPDATED SUBSCRIPTION:",
      updatedSubscription
    );

    console.log(
      "UPDATE ERROR:",
      updateError
    );

    return NextResponse.json({
      success: true,
      review,
      reviews_used: newReviewCount,
    });
  } catch (error: any) {
    console.error(
      "ANALYZE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}