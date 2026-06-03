import { getSession } from "@/lib/session"
import Link from "next/link";


export default async function home() {

  const session = await getSession();
  const isLoggedin = (session && session.isLoggedin)

  const loggedinTSX = (
    <>
      <Link href={"/character"}>캐릭터 선택</Link>
      <form action="/logout" method="POST"><button type="submit">로그아웃</button></form>
    </>
  )

  const notLoggedInTSX = (
    <>
      <Link href={"/login"}>로그인</Link>
      <Link href={"/regist"}>회원가입</Link>
    </>
  )

  return(
    <>
      <h1 className="text-3xl">던전 탐험</h1>

      {
        session.isLoggedin ? loggedinTSX : notLoggedInTSX
      }

    </>
  )
}