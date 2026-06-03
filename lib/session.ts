import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUserData = {
    id : string
}

export type SessionData = {
    user : SessionUserData,
    isLoggedin : boolean
}

const sessionPassword = process.env.SESSION_PASSWORD;

if(!sessionPassword || sessionPassword.length < 32){
    throw new Error("32자 미만의 세션 비밀번호가 필요합니다");
}

export const sessionOptions : SessionOptions = {
    password : sessionPassword,
    cookieName : "cookie_name",
    ttl : 60 * 60 * 24,
    cookieOptions : {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "lax",
        path : "/"
    }
}

export async function getSession() {
    const cookieStore = await cookies();

    return getIronSession<SessionData>(cookieStore, sessionOptions);
}