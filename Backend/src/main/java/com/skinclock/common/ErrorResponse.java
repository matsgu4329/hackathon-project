package com.skinclock.common;

public record ErrorResponse(ApiError error) {

    public record ApiError(String code, String message) {
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(new ApiError(code, message));
    }
}
