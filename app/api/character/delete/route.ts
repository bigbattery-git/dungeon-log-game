import { ERROR401, ERRORJSON, ERRORSERVER } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DELETECharacterResponse } from "@/types/character/character";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    let reqData : {
        id : number
    };

    const response : DELETECharacterResponse = {
        success : false,
        message : null
    }

    const session = await getSession();

    if(!session || !session.isLoggedin){
        response.message = ERROR401;
        return NextResponse.json(response, {status : 401});
    }

    try {
        reqData = await req.json();
    } catch {
        response.message = ERRORJSON;
        return NextResponse.json(response, {status : 400});
    }

    if(!reqData.id){
        response.message = "아이디는 필수입니다";
        return NextResponse.json(response, {status : 400});
    }

    try {
        const chkCharacter = await prisma.character.count({
            where : {
                id : reqData.id,
                deletedAt : null
            }
        })

        if(chkCharacter < 1){
            response.message = "캐릭터가 없습니다.";
            return NextResponse.json(response, {status : 404});
        }

        await prisma.character.update({
            data : {
                deletedAt : new Date()
            }, where : {
                id : reqData.id
            }
        });

        response.message = "캐릭터가 삭제되었습니다.";
        response.success = true;

        return NextResponse.json(response, {status : 200})
    } catch (e) {
        console.error("DELETE /api/character : ",e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}