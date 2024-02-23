import { AppProps } from "next/app";
import Layout from "../components/layout";
import "@/styles/globals.css";

export default function SwitchboardFrontend({ Component, pageProps }: AppProps) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}
