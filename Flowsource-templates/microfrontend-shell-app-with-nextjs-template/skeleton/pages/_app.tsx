import Layout from '../components/layout';
import 'bootstrap/dist/css/bootstrap.css';
import type { AppProps } from "next/app";
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout><Component {...pageProps} /></Layout>
      
  )
}
