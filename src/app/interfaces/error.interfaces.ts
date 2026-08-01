export interface TErrorSource {
    path: string,
    message: string
}

export interface TErrorResponse {
    statusCode?: number,
    stack?: string,
    success: boolean,
    message: string,
    errorSources: TErrorSource[],
    error?: unknown,
}