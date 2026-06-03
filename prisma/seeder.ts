import { prisma } from "@/lib/prisma";

async function main(){
    prisma.$transaction(async (prisma) => {
        await prisma.defaultItem.create({
            data : {
                code : "ITEM-HEALING-01",
                name : "회복물약",
                content : "체력을 2 회복시킵니다."
            }
        })

        await prisma.monster.create({
            data : {
                code : "MONSTER-GOBLIN-01",
                name : "고블린",
                content : "잡몹입니다."
            }
        })
    })
}

main().then(async () => {
    console.log("seeder 완성");
}).catch(async (e) => {
    console.log("seeder 실패:",e);
})