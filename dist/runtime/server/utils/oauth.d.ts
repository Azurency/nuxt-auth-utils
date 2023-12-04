import { githubEventHandler } from '../lib/oauth/github';
import { googleEventHandler } from '../lib/oauth/google';
import { spotifyEventHandler } from '../lib/oauth/spotify';
import { twitchEventHandler } from '../lib/oauth/twitch';
import { auth0EventHandler } from '../lib/oauth/auth0';
import { microsoftEventHandler } from '../lib/oauth/microsoft';
import { discordEventHandler } from '../lib/oauth/discord';
import { battledotnetEventHandler } from '../lib/oauth/battledotnet';
export declare const oauth: {
    githubEventHandler: typeof githubEventHandler;
    spotifyEventHandler: typeof spotifyEventHandler;
    googleEventHandler: typeof googleEventHandler;
    twitchEventHandler: typeof twitchEventHandler;
    auth0EventHandler: typeof auth0EventHandler;
    microsoftEventHandler: typeof microsoftEventHandler;
    discordEventHandler: typeof discordEventHandler;
    battledotnetEventHandler: typeof battledotnetEventHandler;
};
