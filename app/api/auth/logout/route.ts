import { ERRORSERVER } from "@/lib/config";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(){
    try{
        const session = await getSession();

        await session.destroy();

        return NextResponse.json({success : true, message : "로그아웃을 완료했습니다."}, {status : 200});
    } catch (e){
        console.log("POST /api/auth/logout : ", e)
        return NextResponse.json({success : false, message : ERRORSERVER}, {status : 500});
    }
}