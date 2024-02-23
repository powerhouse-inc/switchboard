import Image from "next/image";
import SwitchboardLink from "../text/Link";
import useAuth, { authStore } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Header() {
    const address = authStore((state) => state.address);
    const auth = useAuth();
    const router = useRouter();

    const getClass = (path: string) => {
        const queryField = router.asPath.indexOf("?");
        const routerPath = queryField > -1 ? router.asPath.slice(0, queryField) : router.asPath;
        return routerPath === path ? "text-orange-500 border-orange-500 border-b-4 pb-4 " : "text-black pb-4 ";
    };

    const navLinks = [
        { name: "API Token Generation", path: "/user" },
        { name: "GraphQL Playground", path: "/graphql" },
        { name: "Monetalis", path: "/graphql/monetalis" },
    ];

    return (
        <header className="bg-orange-100 fixed w-full top-0 text-black h-14">
            <nav className="flex justify-between items-center flex-row h-14">
                <div className="flex items-start">
                    <SwitchboardLink href="/">
                        <div className="flex flex-row items-center">
                            <img src="/assets/logo.svg" className="w-10" />
                            Switchboard API
                        </div>
                    </SwitchboardLink>
                </div>
                <div className="flex  justify-center gap-4 pt-3">
                    {navLinks.map((link, i) => (
                        <SwitchboardLink className={getClass(link.path)} href={link.path} key={i}>
                            {link.name}
                        </SwitchboardLink>
                    ))}
                </div>
                <div className="flex flex-row gap-2">
                    <div className="flex items-center  text-orange-300">
                        {address !== "" ? (
                            <SwitchboardLink className="bg-orange-200 rounded-2xl px-4 text-orange-400 flex flex-row items-center gap-2 py-2" href="/user">
                                <span>{address.slice(0, 4) + "..." + address.slice(-4)}</span>
                                <span className="h-5">
                                    <UserCircleIcon className="h-5" />
                                </span>
                            </SwitchboardLink>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="text-orange-300 pr-2 my-auto">
                        <Link href="https://github.com/powerhouse-inc/switchboard-boilerplate" target="_blank">
                            <Image src="/assets/github.svg" alt="GitHub" width="32" height="32" />
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
