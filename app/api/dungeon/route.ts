// app/api/sse/route.ts

import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getUserData } from "@/lib/service/character";
import { battle, chkCharacterDead, exitDungeon, getItem, getMonster, getTrap } from "@/lib/service/dungeon";
import { getSession } from "@/lib/session";
import { getRandomInt } from "@/lib/utils/rand";
import { changeMinToSec } from "@/lib/utils/time";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const session = await getSession();

    if(!session || !session.isLoggedin){
        return new Response(
            JSON.stringify({message : "로그인이 필요합니다"}),
            {
                status : 401,
                headers : {
                    "Content-Type" : "application/json"
                }
            }
        );
    }

    if(!session.user.charId){
        return new Response(
            JSON.stringify({message : "캐릭터를 선택하지 않았습니다"}),
            {
                status : 409,
                headers : {
                    "Content-Type" : "application/json"
                }
            }
        )
    }

    const userData = await getUserData(session.user.charId);
    
    if(!userData){
        return new Response(
            JSON.stringify({message : "캐릭터가 없습니다."}),
            {
                status : 404,
                headers : {
                    "Content-Type" : "application/json"
                }
            }
        )
    }

    const redis = await getRedis();

    await redis.hSet(`character:${session.user.charId}`, userData);

    // 로직
    // redis에 저장할 것
    // 아이템 목록 List rPush
    // 유저 상태 hSet
    // 몬스터 상태 hSet
    // 모험 메시지 rPush -> List 쭉 돌려서 로그 저장할 예정
    // 현재 진행 상태 GET
    
    // 0. 시작 전 필요한 것
    // 0.1 캐릭터 id -> 세션에 저장, 던전 탈출 시 다시 null

    // 1. 기본적으로 상태 쭉 돌려서 진행
    // 1.1 1 : 아이템 획득, 2 : 함정, 3 : 몬스터 조우, 4 : 탈출
    // 1.2 이때, 몬스터 조우 뜨면 몬스터 상태 저장. 그리고 상태 쭉 돌리는 과정 생략하고 전투 진행. 몬스터 죽으면 키 삭제

    const stream = new ReadableStream({
        
        start(controller) {

        let timeSec = 0;
        const send = async () => {
            timeSec += 5;

            if(session.user.charId && await chkCharacterDead(session.user.charId)){
                const mes : string = `${changeMinToSec(timeSec)} : 캐릭터가 죽었습니다.`
                await redis.rPush(`log:${session.user.charId}`, mes);

                await finish(session.user.charId, true);

                controller.enqueue(
                    encoder.encode(
                    `event: done\ndata: ${JSON.stringify({
                        message: mes,
                    })}\n\n`
                    )
                );

                clearInterval(timer);
                controller.close();
                return;
            }

            if(await redis.exists(`monster:${session.user.charId}`)){
                let mes : string;

                if(session.user.charId){
                    mes = (await battle(session.user.charId, timeSec)).message;
                    redis.rPush(`log:${session.user.charId}`, mes);
                    controller.enqueue(
                        encoder.encode(
                                `data: ${JSON.stringify({ "message" : mes })}\n\n`
                            )
                        );
                }
                return;
            }

            const exit = Math.random() * 100;

            if(timeSec > 5 && exit >= 95){

                const mes = exitDungeon(timeSec);

                await redis.rPush(`log:${session.user.charId}`, mes);

                if(session.user.charId){
                    await finish(session.user.charId)
                }

                controller.enqueue(
                    encoder.encode(
                    `event: done\ndata: ${JSON.stringify({
                        message: mes,
                    })}\n\n`
                    )
                );

                clearInterval(timer);
                controller.close();
                return;
            }

            const rnd = getRandomInt(3);

            if(session.user.charId){
                let msg : string = "";
                if(rnd === 0){
                    msg = (await getItem(session.user.charId, timeSec)).message;
                }

                if(rnd === 1){
                    msg = (await getTrap(session.user.charId, timeSec)).message;
                }

                if(rnd === 2){
                    msg = (await getMonster(session.user.charId, timeSec)).message;
                }

                await redis.rPush(`log:${session.user.charId}`, msg);
                
                controller.enqueue(
                encoder.encode(
                        `data: ${JSON.stringify({ "message" : msg })}\n\n`
                    )
                );

                return;
            }
        };

        send();

        const timer = setInterval(() => {
            send();
        }, 5000);

        // 4. 클라이언트가 페이지 이동하거나 연결 끊으면 실행됨
        req.signal.addEventListener("abort", async () => {
            if(session.user.charId){
                await redis.del(`character:${session.user.charId}`);
                await redis.del(`monster:${session.user.charId}`);
                await redis.del(`item:${session.user.charId}`);
                await redis.del(`log:${session.user.charId}`);
            }
                clearInterval(timer);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        },
    });
}

async function finish(id : number, isDead : boolean = false){

    const logDatas :{
        characterId : number,
        content : string
    }[] = [];

    const itemDatas : {
        characterId : number,
        defaultItemId : number
    }[] = [];

    const characterData : {
        exp : number,
        hp : number
    } = {
        exp : 1,
        hp : 1
    }

    const redis = await getRedis();
    
    // redis log:id에 저장된 처음부터 끝까지 데이터를 리스트 ([] 형식)으로 가져오는 거
    const explorationLogData = await redis.lRange(`log:${id}`, 0, -1);
    const itemData = await redis.lRange(`item:${id}`, 0, -1);
    const character = await redis.hGetAll(`character:${id}`);


    (await explorationLogData).forEach((a : string)=> {
        logDatas.push({
            characterId : id,
            content : a
        })
    });

    (await itemData).forEach((a : string) => { 
        itemDatas.push({
            characterId : id,
            defaultItemId : Number(a)
        })
    });

    characterData.hp = Number(character.hp);
    characterData.exp = Number(character.exp);

    await redis.del(`character:${id}`);
    await redis.del(`monster:${id}`);
    await redis.del(`item:${id}`);
    await redis.del(`log:${id}`);

    try {
        await prisma.$transaction(async (prisma) => {

            await prisma.explorationLog.createMany({
                data : [
                    ...logDatas
                ]
            }) ;

            if(isDead){
                await prisma.character.update({
                    where : {
                        id : id
                    },
                    data : {
                        deletedAt : new Date()
                    }
                })
                return;
            }

            await prisma.character.update({
                data : {
                    hp : characterData.hp,
                    exp : characterData.exp
                }, where : {
                    id : id
                }
            })

            await prisma.item.createMany({
                data : [
                    ...itemDatas
                ]
            })


        })

    } catch(e) {
        console.log(e);
        throw new Error("finish 서버 오류 발생");
    }
}