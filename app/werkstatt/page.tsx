import { isAdmin } from '../../lib/server';
import { authConfigured } from '../../lib/auth';
import Workshop from './workshop';
import Login from './login';
export const dynamic='force-dynamic';
export default async function WorkshopPage(){
  return await isAdmin() ? <Workshop/> : <Login configured={authConfigured()}/>;
}
