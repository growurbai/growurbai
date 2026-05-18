import { NextResponse } from "next/server";

export type GenerateErrorStatus =
  | "RATE_LIMIT_EXCEEDED"
  | "INSUFFICIENT_CREDITS"
  | "TRIAL_EXPIRED"
  | "INVALID_IMAGE"
  | "IMAGE_SIZE_INVALID"
  | "CONFIG_ERROR"
  | "GENERATION_FAILED";

export type GenerateErrorPayload = {
  error: true;
  status: GenerateErrorStatus;
  message: string;
};

export class GenerateApiError extends Error {
  readonly error = true as const;

  constructor(
    readonly status: GenerateErrorStatus,
    message: string,
    readonly httpStatusOverride?: number,
  ) {
    super(message);
    this.name = "GenerateApiError";
  }

  toPayload(): GenerateErrorPayload {
    return { error: true, status: this.status, message: this.message };
  }

  resolveHttpStatus(): number {
    return this.httpStatusOverride ?? httpStatusForGenerateError(this.status);
  }
}

const HTTP_STATUS: Record<GenerateErrorStatus, number> = {
  RATE_LIMIT_EXCEEDED: 429,
  INSUFFICIENT_CREDITS: 402,
  TRIAL_EXPIRED: 403,
  INVALID_IMAGE: 400,
  IMAGE_SIZE_INVALID: 400,
  CONFIG_ERROR: 503,
  GENERATION_FAILED: 500,
};

export function httpStatusForGenerateError(status: GenerateErrorStatus): number {
  return HTTP_STATUS[status];
}

export function generateErrorResponse(
  status: GenerateErrorStatus,
  message: string,
): NextResponse<GenerateErrorPayload> {
  return NextResponse.json(
    { error: true, status, message },
    { status: httpStatusForGenerateError(status) },
  );
}

export function generateErrorResponseFromUnknown(err: unknown): NextResponse<GenerateErrorPayload> {
  if (err instanceof GenerateApiError) {
    return NextResponse.json(err.toPayload(), {
      status: err.resolveHttpStatus(),
    });
  }

  const classified = classifyUnknownGenerateError(err);
  return generateErrorResponse(classified.status, classified.message);
}

export function classifyOpenAiHttpFailure(
  httpStatus: number,
  rawBody: string,
): GenerateApiError {
  const body = rawBody.toLowerCase();

  if (
    httpStatus === 429 ||
    body.includes("rate limit") ||
    body.includes("rate_limit") ||
    body.includes("too many requests")
  ) {
    return new GenerateApiError(
      "RATE_LIMIT_EXCEEDED",
      "OpenAI rate limit reached. Please wait a moment and try again.",
    );
  }

  if (
    httpStatus === 402 ||
    body.includes("insufficient_quota") ||
    body.includes("billing") ||
    body.includes("exceeded your current quota") ||
    body.includes("credit balance")
  ) {
    return new GenerateApiError(
      "INSUFFICIENT_CREDITS",
      "OpenAI billing or credit balance is insufficient. Add credits to continue generating.",
    );
  }

  if (httpStatus === 400 && (body.includes("size") || body.includes("dimension"))) {
    return new GenerateApiError(
      "IMAGE_SIZE_INVALID",
      "Image dimensions or size are not supported for generation. Try a smaller PNG or JPG.",
    );
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return new GenerateApiError(
      "CONFIG_ERROR",
      "OpenAI API authentication failed. Check OPENAI_API_KEY configuration.",
    );
  }

  return new GenerateApiError(
    "GENERATION_FAILED",
    `Image generation failed (${httpStatus}): ${truncateForClient(rawBody)}`,
  );
}

function classifyUnknownGenerateError(err: unknown): GenerateErrorPayload {
  if (err instanceof GenerateApiError) return err.toPayload();

  const message = err instanceof Error ? err.message : "Unknown generation error";
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("429")) {
    return {
      error: true,
      status: "RATE_LIMIT_EXCEEDED",
      message: "Generation rate limit exceeded. Please retry shortly.",
    };
  }
  if (
    lower.includes("insufficient_quota") ||
    lower.includes("billing") ||
    lower.includes("credit")
  ) {
    return {
      error: true,
      status: "INSUFFICIENT_CREDITS",
      message: "Billing or credits are insufficient to complete this generation.",
    };
  }
  if (lower.includes("openai_api_key")) {
    return {
      error: true,
      status: "CONFIG_ERROR",
      message: "OPENAI_API_KEY is not configured on the server.",
    };
  }
  if (lower.includes("image") && (lower.includes("invalid") || lower.includes("too large"))) {
    return {
      error: true,
      status: lower.includes("large") ? "IMAGE_SIZE_INVALID" : "INVALID_IMAGE",
      message,
    };
  }

  return {
    error: true,
    status: "GENERATION_FAILED",
    message: truncateForClient(message),
  };
}

function truncateForClient(input: string, max = 480): string {
  const trimmed = input.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}
