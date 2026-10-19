import { isAdmin } from '../../lib/server';
import { getChatGPTUser, chatGPTSignInPath } from '../chatgpt-auth';
import Workshop from './workshop';
export const dynamic='force-dynamic';
export default async function WorkshopPage(){
 const user=await getChatGPTUser();
 if(!await isAdmin())return <main className="wrap workshop"><a className="logo" href="/">TelSoft.</a><h1>Werkstatt / Workshop</h1><p>Dieser Bereich ist nur für freigeschaltete TelSoft-Mitarbeiter zugänglich.<br/>This area is restricted to authorised TelSoft staff.</p>{!user?<a className="button" style={{marginTop:25}} href={chatGPTSignInPath('/werkstatt')} target="_top">Mit ChatGPT anmelden / Sign in</a>:<p style={{marginTop:25}}>Dein Konto hat keinen Zugriff. / Your account does not have access.</p>}</main>;
 return <Workshop/>;
}
