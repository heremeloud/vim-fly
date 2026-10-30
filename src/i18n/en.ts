// English strings: the source of truth. Every other language must have exactly the same keys
// and the same {placeholders} (checked by `npm run check:i18n`).
// Keep this file free of imports so it can also be loaded by plain scripts.

export const en = {
  // Language and tabs
  'lang.title': 'Language',
  'tab.store': 'Home',
  'tab.menu': 'Menu',
  'tab.orders': 'Orders',
  'tab.promos': 'Promos',

  // App shell
  'app.tagline': 'Delivery powered by the best bee dog',
  'app.deliverTo': 'Deliver to',
  'app.searchHint': 'Search bread, lunch box, coffee...',
  'svc.food': 'Food',
  'svc.mart': 'Mart',
  'svc.express': 'Express',
  'svc.ride': 'Ride',

  // Home and countdown
  'home.orderNow': 'Order Now',
  'home.open': 'OPEN',
  'home.watchPilot': 'Watch the Pilot Now',
  'countdown.soon': 'Episode 1 · Coming Soon',
  'countdown.now': 'Now Streaming!',
  'countdown.days': 'Episode 1 airs in {d}d {h}h',
  'countdown.hours': 'Episode 1 airs in {h}h',

  // Menu
  'menu.title': 'Menu',
  'menu.subtitle': '"Why does my life have to be such a mess...?"',
  'kind.points': 'Points',
  'kind.buff': 'Buffs',
  'kind.debuff': 'Debuffs',

  // Orders tab
  'orders.subtitle': 'World Leaderboard',
  'orders.tab.mine': 'My Orders',
  'orders.tab.top': 'Top Customers',
  'orders.orderNo': 'Order #{n}',
  'orders.bestBadge': 'Best',
  'orders.empty': "No orders yet, let's place your first one!",
  'orders.offline': "Oops! Can't reach the worldwide ladder. Here are your best runs saved on this device.",
  'orders.loading': 'Loading… Just a moment!',

  // Receipt
  'receipt.title': 'RECEIPT',
  'receipt.height': 'Height',
  'receipt.reached': 'Location',
  'receipt.total': 'TOTAL',
  'receipt.orderAgain': 'Order Another',
  'receipt.backToStore': 'Back to Store',
  'receipt.newBest': 'New Best Order!',
  'receipt.thanks': 'THANK YOU!',
  'receipt.follow': 'Follow the official account',
  'receipt.shareText': 'I just scored {score} points in Vimmy Fly! Can you beat me? 🐶🐝\nThe bakery is opening soon! 🍞🧀🧈\nStay tuned for the series Bake Love Feeling and please support ViewMim as NoeyCheese! 💕\n🎮: {url}\n\n#BakeLoveFeeling #ViewMim #วิวมิ้ม',
  'receipt.sending': 'Sending your score… Just a moment!',
  'receipt.sendFailed': "Couldn't reach the leaderboard. Your score is saved here.",

  // Onboarding and how to play
  'onboard.title': 'Welcome, new customer!',
  'onboard.nameLabel': 'Your name',
  'onboard.namePlaceholder': 'What should we call you?',
  'onboard.howTitle': 'How to Play',
  'onboard.tap': 'Tap the left or right side of the screen (or press A/D) to flap up and scoot that way!',
  'onboard.catch': 'Catch tasty food for points, fly as high as you can, and dodge the dangerous stuff!',
  'onboard.swipe': 'In trouble? Swipe left or right (or press Shift + A/D) to side dash and dodge! You get 3 dashes per run! Cheese Butter Bread restores 1!',
  'onboard.start': 'Start My Order',

  // Settings
  'settings.title': 'Settings',
  'settings.nameInvalid': 'Enter your name first!',
  'settings.nameBlocked': "You can't use that name. Try another one!",
  'settings.close': 'Close',
  'settings.sound': 'Sound',
  'settings.on': 'On',
  'settings.off': 'Off',

  // Promos and video
  'promos.pilot.title': 'Watch the Pilot',
  'promos.copied': 'Copied for you!',
  'promos.official': 'Official Account',
  'promos.leads': 'Main Leads',
  'promos.role.cheese': 'as Cheese, the bakery owner',
  'promos.role.noey': 'as Noey, the lawyer',
  'promos.vimmy.role': 'Vimmy loves Mami and Mumu soooo much!!!',
  'promos.soon': 'Coming soon!',
  'video.close': 'Close',
  'video.title': 'Video',
  'video.openYoutube': 'Open on YouTube',
  'video.loading': 'Loading the pilot… Just a moment!',

  // In-game HUD
  'hud.shield': 'SHIELD',
  'hud.dash': 'DASH',
  'hud.swipeHint': 'Swipe left or right to dash & dodge!',
  'hud.tap': 'Tap',
  'hud.paused': 'Paused',
  'hud.dashPlus': '+1 Dash',
  'hud.stunned': 'STUNNED',
  'hud.power': 'POWER',
  'hud.dizzy': 'DIZZY',
  'hud.shy': 'SHY',
  'hud.slow': 'SLOW',
  'hud.magnet': 'MAGNET',
  'shield.blocked': 'Blocked!',

  // Zones and finales
  'zone.stage': 'Stage {n}',
  'zone.ruralRoad': 'Rural Road',
  'zone.bakery': 'Heartwarming Bakery',
  'zone.cafes': 'Cafe',
  'zone.mall': 'Shopping Mall',
  'zone.lawOffice': 'CC Law Office',
  'zone.gym': 'Gym',
  'zone.courtroom': 'The Courtroom',
  'zone.aquarium': 'Aquarium',
  'zone.residence': "Noey's Apartment",
  'zone.bakeLove': 'Heart Baked Love Bakery',
  // The last stretch of each location (see src/core/finales.ts).
  'finale.ruralRoad': 'Don\'t crash!',
  'finale.bakery': 'Fresh from the oven!',
  'finale.cafes': 'Coffee rush!',
  'finale.mall': 'Shopping spree!',
  'finale.lawOffice': 'Paperwork pile-up!',
  'finale.gym': 'Pump it up!',
  'finale.courtroom': 'Order in the court!',
  'finale.residence': 'Cozy night in!',
  'finale.aquarium': '"Noey, you like Wan, don\'t you?!"',

  // Effects (item descriptions)
  'effect.points.gain': '+{n} points',
  'effect.points.loss': '-{n} points',
  'effect.refillsDash': 'Restores 1 side dash',
  'effect.dash': 'Dash upward for {s}s',
  'effect.shield': 'Blocks the next debuff',
  'effect.cleanse': 'Clears stun and dizziness',
  'effect.strongFlap': 'Fly up {p}% stronger for {s}s',
  'effect.doublePoints': 'Double points for {s}s',
  'effect.magnet': 'Pulls nearby food and items toward you for {s}s',
  'effect.stun': "Can't move for {s}s",
  'effect.disorient': 'Left and right swap for {s}s',
  'effect.shy': 'Clumsy flapping for {s}s! Each flap gives you a random boost',
  'effect.slow': 'Flying {p}% slower for {s}s',
  'effect.crash': 'Knocks you down and stuns you for {s}s',
  'effect.swerve': 'Shoves you sideways',

  // Item names
  'item.pandanCustardBread': 'Pandan Custard Bread',
  'item.cheeseButterBread': 'Cheese Butter Bread',
  'item.cilantroBread': 'Cilantro Bread',
  'item.shiopan': 'Shiopan',
  'item.fishSauceBread': 'Fish Sauce Bread',
  'item.oyster': 'Oyster',
  'item.sandwich': 'Sandwich',
  'item.pasta': 'Pasta',
  'item.tomYum': 'Tom Yum',
  'item.coffee': 'Coffee',
  'item.wine': 'Wine',
  'item.shrimpFriedRiceBox': 'Shrimp Fried Rice Lunch Box',
  'item.goldenRetriever': 'Golden Retriever',
  'item.lawyerSuit': 'Lawyer Suit',
  'item.handkerchief': 'Handkerchief',
  'item.rollingPin': 'Rolling Pin',
  'item.planner': 'Planner',
  'item.helicopter': 'Helicopter',
  'item.gavelHammer': 'Judge\'s Hammer',
  'item.carCrash': 'Car Crash',
  'item.cheesePopcorn': 'Cheese Popcorn',
  'item.dogEars': 'Dog Ears Headband',
  'item.iceCream': 'Ice Cream',
  'item.kitten': 'Kitten',

  // Pickup callouts: buffs
  'buff.oyster': 'Double Points!',
  'buff.lawyerSuit': 'Shield!',
  'buff.handkerchief': 'Good as New!',
  'buff.rollingPin': 'Power Fly!',
  'buff.helicopter': 'Helicopter!',
  'buff.goldenRetriever': 'Magnet!',

  // Pickup callouts: debuffs
  'debuff.cilantroBread': 'DIZZY!',
  'debuff.fishSauceBread': 'SLOWED!',
  'debuff.planner': 'DISAPPOINTED! -300',
  'debuff.gavelHammer': 'BONKED¡!',
  'debuff.carCrash': 'KABOOM! -150',
  'debuff.dogEars': 'Embarrassing!',
  'debuff.kitten': 'Move!',
};

/** Keys each language file must translate. Universal strings live in common.json instead. */
export type LangKey = keyof typeof en;
