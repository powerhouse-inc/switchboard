import { useRouter } from "next/router";

export default function DriveGraphQL() {
    const router = useRouter();
    const query = router.query.query;

    return <iframe src={`${process.env.NEXT_PUBLIC_SWITCHBOARD_HOST}/explorer/${router.query.driveId}${query ? "?query=" + query : ""}`} height="100%" width="100%" className="min-h-[calc(100vh-63px)]" />;
}
