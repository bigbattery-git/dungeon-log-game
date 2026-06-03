export interface POSTLoginResponse {
    success : boolean,
    message : null | string,
    error ?: {
        email ?: string[] | undefined,
        password ?: string[] | undefined
    } 
}