import { z } from "zod"

export const POSTRegistRequestSchema = z.object({
    name : z.string("이름은 꼭 작성하셔야 합니다.").trim().max(6, "이름은 6자 까지만 적어주세요"),
    password : z.string("비밀번호는 꼭 작성하셔야 합니다.").trim().min(8, "비밀번호는 최소 8자 이상이 필요합니다"),
    email : z.email("이메일 형태로 적어주세요")
});

export type POSTRegistRequest = z.infer<typeof POSTRegistRequestSchema>;