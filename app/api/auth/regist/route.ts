import { hashPassword } from "@/lib/bcrypt";
import { ERROR422, ERRORJSON, ERRORSERVER } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { POSTRegistRequest, POSTRegistRequestSchema } from "@/schema/auth/regist";
import { POSTRegistResponse } from "@/types/auth/regist";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod";

export async function POST(req : NextRequest){
    let reqData : POSTRegistRequest | null | undefined;
    const response : POSTRegistResponse = {
        success : false,
        message : null
    }
    try{
        reqData = await req.json();
    }catch (e) {    
        response.message = ERRORJSON;
        return NextResponse.json(response, {status : 400});
    }

    const zodReqData = POSTRegistRequestSchema.safeParse(reqData);

    if(!zodReqData.success){
        response.message = ERROR422;
        response.error = zodReqData.error.flatten().fieldErrors;

        return NextResponse.json(response, {status: 422})
    }

    try{
        const chkSameEmail = await prisma.user.count({
            where : {
                email : zodReqData.data.email
            }
        });

        if(chkSameEmail > 0) {
            response.message = "이미 존재하는 이메일입니다.";
            return NextResponse.json(response, {status : 400});
        }

        const hashedPassword = await hashPassword(zodReqData.data.password);

        await prisma.user.create({
            data : {
                email : zodReqData.data.email,
                name : zodReqData.data.name,
                password : hashedPassword
            }
        })

        response.success = true;
        response.message = "회원가입이 완료되었습니다.";

        return NextResponse.json(response, {status : 200});
    } catch (e) {
        console.error("/api/auth/regist : ", e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}