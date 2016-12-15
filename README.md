# The DDP Party App

- Utilizes AWS Lambda, DynamoDB, and S3.
- Mobile front end written in Angular and Cordova


## Developer Setup

Set up a new Cordova project.

Cordova plugins needed:
- cordova-plugin-camera
- cordova-plugin-compat
- cordova-plugin-file
- cordova-plugin-file-transfer
- cordova-plugin-geolocation
- cordova-plugin-inappbrowser
- cordova-plugin-whitelist
- phonegap-facebook-plugin


#### Notes:
- The maps API key in index.html will need to be substituted
- s3url and lambdaUrl need to be substituted

## VISION:

The vision is to create an Open-Source “Tinder Of Partying” that will allow anyone who wants to Party in a “Decentralized” manner to easily geolocate each other, enabling free-roaming Partiers to connect and unite in celebration. 

Historically, DDPs were not hosted very frequently, but as the movement spreads worldwide, the need for such an app will increase. And it also allows people who use smartphone-audio-synchronizing apps or tune multiple radios into traditional radio stations to meet up and create small-scale DDPs, bike Parties, etc.  

We’d also like the app to be able to be used 24/7 for DDP enthusiasts to link up with the “hidden community” of very special people who seem to consistently resonate with both the DDP and each other. Just a simple tool for locating cool people in your vicinity (between Parties).

The DDP’s ultimate objective is to unite the entire world in a Simultaneous Global Dance Party and this app is the tool that will one day enable it!   

## ETHOS (adapted from The Official DDP Field Manual):

The DDP AKA “The Party Revolution” was founded on Open-Source principles and has consistently held true to them for the past 7.5 years. Our objective is to create the most inclusive and transcendent “Capital-P Partying” experiences possible; as outlined in The Party Manifesto: http://bit.ly/PartyManifesto

The “Decentralized” in “Decentralized Dance Party” denotes the obvious fact that the DDP has no Central audio source and no Central location. But “Decentralized” also references the less conspicuous fact that the DDP is as much about Decentralization as it is Partying.

And from day one, Open-Source ideology and a resolute adherence to the “Of The People, By The People, For The People” mantra has guided the evolution of the DDP. That’s why the DDP has always been crowdfunded (funded by a Decentralized network of individuals) to the greatest possible degree. The choice is ideologically-driven. 

And while crowdfunding The Party Revolution hasn’t been lucrative, it has permitted us to retain full creative control and evolve with awesomeness and integrity; championing a message that we hope will resonate and ripple outwards for years to come: "Bringing People Together And Setting Them Free”.

Over the years, people have told us time and time again that their favorite aspect of the DDP is the fact that it’s free of any political agenda and 100% inclusive. Rest assured, this is our favorite aspect as well.

And it must be realized that in order for the DDP to remain 100% inclusive and free of any corruptive political influences, a resolute adherence to Open-Source principles is 100% required. 

## BUT ISN’T OPEN-SOURCE / DECENTRALIZATION “POLITICAL” AS WELL?

No. Decentralization is the antithesis of politics, and the process by which all Centralized power structures can be #Bypassed and rendered permanently obsolete.

Whereas political action involves competitively (and often violently) acquiring power in order to compel the actions of others via the threat or use of force, the Decentralization movement is 100% voluntary, peaceful, and cooperative. Whereas Politics is all about coercion and control, Decentralization is concerned only with maximizing human freedom. It’s Openly innovating and collaborating to Become The Change You Want To See, rather than begging those in power to create it for you. 

It is the first global revolution that is 100% Inclusive and 100% Of The People, By The People, For The People; an all-inclusive ACCEPTANCE movement, rather than any sort of divisive political RESISTANCE.

The Decentralization movement's ability to apolitically accept all of humanity into its ranks is the core from which this non-violent, leaderless movement truly derives its power. We're all in this together, and together we can succeed!

Naturally, the DDP app is 100% Open-Source, and The Official DDP Field Manual will also be released as a fully Open-Source strategy guide that will allow anyone anywhere to create their own Autonomous DDP Party Cells. We’re also planning to release the DDP logo and every single photo, video and all other creative materials with zero copyright restrictions. 

The DDP is our gift to the world and a movement that is truly unique to history. With the proper guiding principles, we believe that a dynamic-yet-resilient community-driven culture will emerge and The Party Revolution will continue to evolve with awesomeness and integrity on a global scale.

We're all in this together, and together we can succeed!
Thanks for your support!

## APP FEATURES:


- On the landing screen, there is a “PARTY” button. Tapping the “PARTY” button magically transforms you into a small geotagged boombox on a map of your city, which also shows a bunch of other boomboxes representing your Party comrades and a large Powerglove that represents the main DDP radio transmitter. 


- There is currently a photo feature as well that allows geotagged photos to be posted on the map. Not sure yet whether this feature should be retained or not. If it’s complicated and slows the app down, then it’s probably not worth retaining (This should be discussed / determined ASAP).


- There is a group chat feature that is buggy and broken. It needs to be converted to just be a direct message utility between individual Partiers.

## CURRENT STAGE OF DEVELOPMENT:

- The basic app works fairly well but is currently only live on Android. It was designed in Cordova though, which apparently will make porting it over to iOS pretty simple. Dave MacDonald was the original programmer, but is now too busy to finalize development and has released his code with an Open-Source license to that we can all build on it. We have acquired developer accounts for the DDP that will host the app on the Google Play and Apple Store once the iOS version is ready.

- There are several interested developers and I’m about to publicly announce that the code is now Open-Source and put the word out that we are seeking help and a good number of people should soon be signed on to assist!

- We also have a Facebook chat group set with a bunch of people to test the app as well once it has been revised. 

## FEATURES / OPERABILITY TO ADD (listed in descending degree of importance) NEEDED BY DECEMBER 31st, 2016 (for the New Year’s Eve DDP):

- iOS functionality!
- Not sure if the app needs to be open for your boombox locator tag to show up and move around. It should definitely always be updating, even if the app is only on in the background.  
- Each person’s personal boombox icon pointer should be coloured green, allowing them to easily see themselves moving around on the Party Map. All the other boomboxes should remain the current grey / fuschia colour.
- It would be GREAT if a the group chat could be removed and a direct chat feature could be enabled in time.
- The formatting of the Party Manifesto is a bit messed up (the video embeds and etc.). Would be great to get this fixed. The intended layout can be seen at: http://bit.ly/PartyManifesto
- Ensure that the app is sufficiently optimized and has enough bandwidth (or whatever the term is) to handle potentially 1000+ simultaneous users.

## LEGAL:

- It would be great to get someone with legal knowledge to help us upgrade the terms of service to be sure we’ve got all bases covered.

## FEATURES TO ADD DOWN THE ROAD / FUTURE CONSIDERATIONS:

Although we’d like to keep the app pretty simple and probably leave complicated features like photo-sharing and etc. to other apps / platforms, a few features / functionalities down the road would be great:


- We’d like the app to be able to be used 24/7 for DDP enthusiasts to link up with the “hidden community” of very special people who resonate with both the DDP and each other. Just a simple tool for meeting cool people in your vicinity. P2P chat will be essential here.


- I think that Facebook is currently required to log in. We should probably update it so that those without Facebook profiles can also join. Maybe adding a “login with Google” feature as well would be good enough? We could build our own in-app profile system, but that would probably get pretty complicated and potentially open the platform up to abuse (people using fake identities, etc). Facebook / Google integration is also a good way for people to connect and keep in touch after the Party has concluded… We cna discuss :)


- International availability, so anyone anywhere in the world can download the app and use it.


- Whatever is required in terms of server capacity to increase speeds and scalability for global app use will need to be done.


- It would also be great if people hosting Bike Raves / Bike Parties (and other roaming street Parties that observed the DDP’s “Capital-P Party” ethos) were able to use the DDP app to coordinate their Party actions. Amp.me and other apps allow people to create synchronized smartphone Parties and these will likely soon grow and flourish…

THANKS!

## RESOURCES:
- Github: https://github.com/the-DDP/DDP-APP
- Trello: https://trello.com/b/O9Oz3OIY/ddp-app-for-decentralized-partying 
- Slack: https://theddp.slack.com/messages/ddp-app


>>> Whitepaper written by Gary, who has limited knowledge of coding / app stuff (please forgive).
>>> More info at www.TheDDP.com
