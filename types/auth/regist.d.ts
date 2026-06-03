export interface POSTRegistResponse {
    success : boolean,
    message : null | string,
    error ?:  {
        name?: string[] | undefined;
        password?: string[] | undefined;
        email?: string[] | undefined;
    },
}