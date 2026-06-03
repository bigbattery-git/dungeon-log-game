import {email, z} from "zod";

export const POSTLoginRequestSchema = z.object({
    email : z.email("이메일 형태로 보내주세요."),
    password : z.string("비밀번호는 필수 입니다.")
});

export type POSTLoginRequest = z.infer<typeof POSTLoginRequestSchema>