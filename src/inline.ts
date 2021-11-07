import * as db from './db';
import cache from './cache';
import * as middleware from './middleware';

/**
 * Helper function for reply keyboard
 * @param {Array} keys
 * @return {Object} reply_markup
 */
function replyKeyboard(keys) {
  return {
    parse_mode: 'html',
    reply_markup: {
      keyboard: keys,
    },
  };
};

/**
 * Helper function to remove keyboard
 * @return {Object} reply_markup
 */
function removeKeyboard() {
  return {
    parse_mode: 'html',
    reply_markup: {
      remove_keyboard: true,
    },
  };
};

/**
 * Initialize categories from config
 * @param {Object} bot
 * @param {Object} config
 * @return {Array} keys
 */
function initInline(bot, config) {
  const keys = [];
  // Get categories from config file
  for (const i in cache.config.categories) {
    if (i !== undefined) {
      keys.push([cache.config.categories[i].name]);
      const subKeys = [];
      // Check if it has no subcategory
      if (cache.config.categories[i].subgroups == undefined) {
        // Create category button events for start with parameter
        // Full category name to 64 Byte without special chars
        let startStr = '/start ' + cache.config.categories[i].name
          .replace(/[\[\]\:\ "]/g, '')
          .substr(0,63);
        bot.hears(startStr, (ctx) => {
          ctx.session.mode = undefined;
          ctx.session.modeData = undefined;
          // Info text
          if (cache.config.categories[i].msg != undefined) {
            middleware.reply(ctx, cache.config.categories[i].msg);
          } else {
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${cache.config.categories[i].name}</b>`, removeKeyboard());
            ctx.session.group = cache.config.categories[i].group_id;
            ctx.session.groupCategory = cache.config.categories[i].name;
          }
        });
        // Create subcategory button events
        bot.hears(cache.config.categories[i].name, (ctx) => {
          ctx.session.mode = undefined;
          ctx.session.modeData = undefined;
          // Info text
          if (cache.config.categories[i].msg != undefined) {
            middleware.reply(ctx, cache.config.categories[i].msg);
          } else {
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${cache.config.categories[i].name}</b>`, removeKeyboard());
            ctx.session.group = cache.config.categories[i].group_id;
            ctx.session.groupCategory = cache.config.categories[i].name;
          }
        });
        continue;
      }
      // Get subcategories
      for (const j in cache.config.categories[i].subgroups) {
        if (j !== undefined) {
          let categoryFullId = [cache.config.categories[i].name +
          ': ' + cache.config.categories[i].subgroups[j].name];
          subKeys.push(categoryFullId);

          // Create subcategory button events for start with parameter
          // Full category name to 64 Byte without special chars
          let startStr = '/start ' + JSON.stringify(categoryFullId)
            .replace(/[\[\]\:\ "]/g, '')
            .substr(0,63);
          bot.hears(startStr, (ctx) => {
            ctx.session.mode = undefined;
            ctx.session.modeData = undefined;
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${categoryFullId}</b>`, removeKeyboard());
            // Set subgroup
            ctx.session.group = cache.config.categories[i].subgroups[j].group_id;
            ctx.session.groupCategory = cache.config.categories[i].subgroups[j].name;
          });

          // Create subcategory button events
          bot.hears(categoryFullId, (ctx) => {
            ctx.session.mode = undefined;
            ctx.session.modeData = undefined;
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${categoryFullId}</b>`, removeKeyboard());
            // Set subgroup
            ctx.session.group = cache.config.categories[i].subgroups[j].group_id;
            ctx.session.groupCategory = cache.config.categories[i].subgroups[j].name;
          });
        }
      }
      subKeys.push([cache.config.language.back]);
      // Create subcategory buttons
      bot.hears(cache.config.categories[i].name, (ctx) => {
        ctx.session.mode = undefined;
        ctx.session.modeData = undefined;
        middleware.reply(ctx, cache.config.language.whatSubCategory,
            replyKeyboard(subKeys));
      });
    }
  }
  return keys;
};

/**
 * Callback query handler
 * @param {Object} bot
 * @param {Object} ctx
 */
function callbackQuery(bot, ctx) {
  // Check whether to end callback session
  if (ctx.callbackQuery.data === 'R') {
    ctx.session.mode = undefined;
    ctx.session.modeData = undefined;
    middleware.reply(ctx, cache.config.language.prvChatEnded);
    return;
  }
  // Get Ticket ID from DB
  const id = ctx.callbackQuery.data.split('---')[0];
  const name = ctx.callbackQuery.data.split('---')[1];
  let category = ctx.callbackQuery.data.split('---')[2];
  const ticketid = ctx.callbackQuery.data.split('---')[3];
  ctx.session.mode = 'private_reply';
  ctx.session.modeData = {
    ticketid: ticketid,
    userid: id,
    name: name,
    category: category,
  };
  middleware.msg(ctx.callbackQuery.from.id, ctx.chat.type !== 'private' ?
    `${cache.config.language.ticket} ` +
    `#T${ticketid.toString().padStart(6, '0')}` +
    `\n\n` +
    cache.config.language.prvChatOpened : cache.config.language.prvChatOpenedCustomer,
    {
      parse_mode: 'html',
      reply_markup: {
        html: '',
        inline_keyboard: [
          [
            {
              'text': cache.config.language.prvChatEnd,
              'callback_data': 'R',
            },
          ],
        ],
      },
    });

  // TODO: forward to bot? not possible without triggering start command
  // var t = ('https://t.me/' + bot.options.username + '?start=X');
  ctx.answerCbQuery(cache.config.language.instructionsSent, true,
      /* {
        'url': t,
      } */
    );
};

export {
  callbackQuery,
  initInline,
  replyKeyboard,
  removeKeyboard,
};
