import { verifyPassword } from "@/lib/bcrypt";
import { ERROR422, ERRORJSON, ERRORSERVER } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { POSTLoginRequest, POSTLoginRequestSchema } from "@/schema/auth/login";
import { POSTLoginResponse } from "@/types/auth/login";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    let reqData : POSTLoginRequest | null | undefined;
    const response : POSTLoginResponse = {
        success : false,
        message : null
    }

    try {
        reqData = await req.json();
    } catch {
        response.message = ERRORJSON;
        return NextResponse.json(response, {status : 400});
    }

    const zodReqData = POSTLoginRequestSchema.safeParse(reqData);

    if(!zodReqData.success){
        response.message = ERROR422;
        response.error = zodReqData.error.flatten().fieldErrors
        return NextResponse.json(response, {status : 422});
    }

    try {
        const result = await prisma.user.findFirst({
            select :{
                id : true,
                password : true
            }, where : {
                email : zodReqData.data.email
            }
        });

        if(!result || !await verifyPassword(zodReqData.data.password, result.password)){
            response.message = "아이디 또는 비밀번호가 틀렸습니다.";
            return NextResponse.json(response, {status : 400});
        }

        const session = await getSession();
        session.user = {
            id : result.id
        }
        await session.save();

        response.success = true;
        response.message = "로그인을 성공했습니다.";

        return NextResponse.json(response, {status : 200});

    } catch (e) {
        console.error("POST /api/auth/login : ", e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}