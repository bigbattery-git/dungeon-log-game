export type POSTCharacterError = {
    name?: string[] | undefined;
    str?: string[] | undefined;
    def?: string[] | undefined;
    luk?: string[] | undefined;
    hp?: string[] | undefined;
}

export interface POSTCharacterResponse {
    success : boolean,
    message : string | null,
    error ?: POSTCharacterError
}

export type Character = {
    name: string;
    id: number;
    str: number;
    def: number;
    hp: number;
    luk: number;
    exp: number;
}

export interface GETCharacterResponse {
    success : boolean,
    message : string | null,
    error ?: {
        name?: string[] | undefined;
        str?: string[] | undefined;
        def?: string[] | undefined;
        luk?: string[] | undefined;
        hp?: string[] | undefined;
    },
    data ?: Character[]
}

export interface POSTCharacterSelectResponse{
    success : boolean,
    message : null | string
}

export interface DELETECharacterResponse {
    success : boolean,
    message : string |null
}