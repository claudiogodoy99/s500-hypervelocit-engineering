namespace TicTacToe.Api.Models;

public sealed class ServiceResult<T>
{
    private ServiceResult(T? value, ErrorResponse? error, int statusCode)
    {
        Value = value;
        Error = error;
        StatusCode = statusCode;
    }

    public T? Value { get; }

    public ErrorResponse? Error { get; }

    public int StatusCode { get; }

    public bool IsSuccess => Error is null;

    public static ServiceResult<T> Success(T value)
    {
        return new ServiceResult<T>(value, null, StatusCodes.Status200OK);
    }

    public static ServiceResult<T> Failure(string error, int statusCode)
    {
        return new ServiceResult<T>(default, new ErrorResponse(error), statusCode);
    }
}