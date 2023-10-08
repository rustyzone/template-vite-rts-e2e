import clog from "./clog";
import supabase from "../lib/initSupabase";

  // singleton to check if user is logged in
  class User {
    private static instance: User;
    private _isLoggedIn: boolean = false;
    private _user: any = null;

    private constructor() {
      clog("user constructor");
      this.checkLogin();
    }

    static getInstance() {

      if (!User.instance) {
        User.instance = new User();
      }
      return User.instance;
    }

    // check if user is logged in supabase
    async checkLogin() {

      const { data: authListener } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          clog("Auth state changed event", event, session);
          if (event === "SIGNED_IN") {
            this._isLoggedIn = true;
            this._user = session?.user;
          } else {
           
            this._isLoggedIn = false;
            this._user = null;
          
          }
        }
      );
      clog("auth listener", authListener);
    }

    get isLoggedIn() {
      return this._isLoggedIn;
    }

    get user() {
      return this._user;
    }

    // Login with access and refresh token
    async loginWithToken(a: string, r: string) {
      if (this._isLoggedIn) {
        clog("already logged in");
        return;
      }
      clog("attempt login with token", a, r);
      const { error, data } = await supabase.auth.setSession({
        refresh_token: r,
        access_token: a,
      });

      clog("user", data, error);
    }

   
   
    getUserJwt = async (): Promise<string | undefined> => {
      return (await supabase.auth.getSession()).data.session?.access_token

    }

    // Login with email and password
    async login(email: string, password: string) {
      if (this._isLoggedIn) {
        clog("already logged in");
        return;
      }

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      clog("user", data, error);

      if (error) {
        clog("error", error);
      }

      this._isLoggedIn = true;

      this._user = data?.user;

      return data;
    }


    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        clog("error", error);
      }

      this._isLoggedIn = false;
      this._user = null;
    }
  }


  export default User;