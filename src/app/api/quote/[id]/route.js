import { updateQuote, deleteQuote, changeQuoteStatus, replyToQuote, assignQuote } from "../../../server/controllers/quoteController";

export async function PATCH(req, context) {
  const params = await context.params;
  return updateQuote(req, params.id);
}

export async function DELETE(req, context) {
  const params = await context.params;
  return deleteQuote(req, params.id);
}

export async function PUT(req, context) {
  const params = await context.params;
  const body = await req.json();
  
  if (body.status) {
    return changeQuoteStatus(body, params.id);
  } else if (body.message && body.senderId) {
    return replyToQuote(body, params.id);
  } else if (body.assignedUserId) {
    return assignQuote(body, params.id);
  }
  
  return new Response(JSON.stringify({ success: false, message: "Invalid request" }), { status: 400 });
}
