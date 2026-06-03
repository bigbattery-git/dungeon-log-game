import { z } from "zod"

export const POSTCharacterRequestSchema = z.object({
    name : z.string("이름을 지어야 합니다."),
    str : z.int().min(1).nullish(),
    def : z.int().min(0).nullish(),
    luk : z.int().min(1).nullish(),
    hp : z.int().min(10).nullish()
});

export type POSTCharacterRequest = z.infer<typeof POSTCharacterRequestSchema>