var secret = require("./secret"),
    MTGChannelID = secret.MTGChannelID,
    database = secret.database,
    dbhost = secret.dbhost,
    dbpassword = secret.dbpassword,
    dbuser = secret.dbuser,
    MyChatID = secret.MyChatID,
    token = secret.token,
    TelegramBot = require('node-telegram-bot-api'),
    Cron = require('cron').CronJob,
    bot = new TelegramBot(token, {polling: true}),
    request = require('request'),
    url = 'http://api.icndb.com/jokes/random',
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host     : dbhost,
        user     : dbuser,
        password : dbpassword,
        database : database
    }),
    datetime = require('node-datetime'),
    Random = require("random-js")(),
    formats = [
        "Модерн",
        "Двухголовый Гигант",
        "Паупер",
        "Меня не будет",
        "Приду, но не буду играть"
    ],
    option = {
        "reply_markup": JSON.stringify({
            "inline_keyboard": [
                [{text: formats[0], callback_data: formats[0]}],
                [{text: formats[1], callback_data: formats[1]}],
                [{text: formats[2], callback_data: formats[2]}],
                [{text: formats[3], callback_data: formats[3]}],
                [{text: formats[4], callback_data: formats[4]}]
            ]
        })
    },
    moment = require('moment'),
    swear = {
        stealTV:["Ублюдок, мать твою!","А ну иди сюда, говно собачье!","Что, решил ко мне лезть?",
            "Ты, засранец вонючий, мать твою!","Попробуй меня трахнуть, я тебя сам трахну!",
            "Ублюдок, онанист чертов!","Будь ты проклят!","Иди сюда, идиот!","Трахать тебя и всю твою семью!",
            "Говно собачье, жлоб вонючий!","Дерьмо, сука, падла!","Иди сюда, мерзавец!",
            "Негодяй, гад, иди сюда, ты, говно, ЖОПА!"],
        adjective:["вонючий","собачий","чертов","хренов","ублюдочный","жопорукий","идиотский","сучий","проклятый","херов",
            "жлобский","мерзкий","дерьмовый","ссыкливый","гадский","мразотный","блевотный","засраный","контуженный",
            "плюгавый","кривоногий","жеванный","фуфлыжный","дебильный","хреноголовый","отсталый","отвратительный",
            "убогий","кривой","косой","траханный","потраченный","неполноценный","мохнозадый"],
        noun:["ублюдок","говноед","засранец","онанист","идиот","жлоб","дерьма кусок","сучий сын","подонок","мерзавец",
            "негодяй","гад","синяк","хер","мудак","долбозвон","чмырь","алкаш","мордач","пердак","выпук",
            "быдлан","слабак","анус","гидроцефал","дурак","шлепок","злыдень","пёс","козёл","конь","индюк","урод",
            "дегенерат","говнюк","тыряльщик"],
        will:["отпинаю","трахну","огрею","отлуплю","уничтожу","изобью","расхренебеню","поломаю","дезинтегрирую",
             "дизассемблирую","на ноль умножу","трепанирую","тресну","отпесочу","убью","уделаю","разхреначу","отмудохаю"],
        chem:["ударом ноги с разворота","голыми руками","черенком от лопаты","прикладом автомата","карандашом",
            "этим теликом","твоей же оторванной рукой","конским дилдаком твоей мамаши","книгой по сопромату",
            "банкой солёных огурцов","шикарным видеопроигрывателем Sony JH-1 HDCAM","моей коллекцией фотографий котиков",
            "этим ножом"],
        modern:["Опять модерн, и как вам не надоело, куски говна собачьего?",
            "Модерн? Да я вас декой из пятидесяти девяти лесов и одного рунолапого медведя уделаю, казуалы сраные!",
            "Ублюдки, вашу мать, достали своим сучим модерном, пошли нахер!",
            "Понасобирают засраных колод из говна и палок, и голосуют за модерн. Ну не дебилы?",
            "Гляньте сколько жидовских контролей набежало! Что за радость всю партию на контру дрочить?",
            "Модерн. Да, вашу мать. Снова трижды проклятый модерн, чтоб вас Роузвотер трахнул!"],
        pauper:["О, паупер! Ну вы жлобы, даете! Сподобились таки руку из чужой жопы вытащить, чтобы проголосовать за это дерьмо."],
        twohg:["Да, будет вонючий 2ГГ. Знаете кто за него голосовал? Гомосеки-онанисты."],
        split:["Разбирайтесь с этой мерзкой ничьей сами, а я пошел отсюда",
            "Чёртовы мракобесы, жопой пожеванные! Ну почему нельзя было за что-то одно проголосовать?",
            "Хреновы плюралисты, мать вашу!"
        ],
        elses:["Идите нахер, уроды вонючие!","Зачем я это вообще делаю?"]
    };
    connection.connect();
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

function getQuery(qer, callback) {
    connection.query(qer, function(err, result) {
        if (err) {
            callback(err,null);
        } else {
            callback(null, result); // GMT+2
        }
    });
}

function getnow() { //get now time
    var dt = datetime.create();
    return dt.format('Y-m-d H:M:S');
}

function startPoll(id)
{
    bot.sendMessage(id, Random.pick(['Как я вас ненавижу, мудацкие вы куски говна!\nНо сраный опрос сделать надо.',
        'Все, кто не долбятся в жопу, голосуют!\nПоверили, ублюдки?\nГолосовать должны даже те, кто долбятся!\nЭто вам не хренов ИГИЛ!',
        'Не проходите мимо, шлюшьи дырки!\nНадо отметиться!\nИ на этот раз не мочой в вонючем лифте!',
        'Скоро пятница, а я тут на вас, хикканов собачих, время трачу!\nЧто за срань!',
        'Нате, сволочи! Вздумали ко мне лезть?\nПроголосуйте сначала!','Голосуем! Я бы еще поболтал, но занят чпоканьем ваших мамаш.',
        'Голосуйте побыстрей, а то тут какая-то мразотная сука на мой телик глаз положила.',
        'Нажмите на одну из этих уродских кнопок, и я пойду.','Бесит меня это дерьмо! Тыкните в любую срань которую хотите и всё!']), option);
    getQuery("INSERT INTO voters VALUES ('0','"+getnow()+"','query','bot')",
        function(err) {
            if (err) {
                console.log("ERROR : ",err);
            }
        }
    );
}

function findElement(arr,element) {
    var temp=[];
    for (var i=0;i<arr.length;i++)
    {
        if (arr[i]===element)
        {
            temp.push(i);
        }
    }
    return temp;
}

function getMaxID(arr) {
    var tmp=0,
        id=0;
    for (var i in arr){
        if (arr[i]>tmp){
            tmp=arr[i];
            id=i;
        }
        if (arr[i]=tmp){
            return 1000;
        }
    }
    return id;
}

function showResults(id,command){
    getQuery('SELECT * FROM voters WHERE time>(SELECT MAX(time) FROM voters WHERE user_id=0);',
        function(err, last_query_time) {
            if (err) {
                console.log("ERROR : ",err);
            }
            else {
                if (last_query_time.length != 0) {
                    var res = "";
                    var tex = "";
                    var arr = [];
                    //console.log(last_query_time);
                    for (var i in last_query_time) {
                        tex += capitalize(Random.pick(swear.adjective))+" *"+last_query_time[i].name + "*:\n["+last_query_time[i].how_voted + "](http://www.example.com/)\n";
                        arr.push(last_query_time[i].how_voted);
                    }
                    //bot.sendMessage(id, res);
                    var temp = [];
                    for (var j in formats) {
                        temp.push(findElement(arr, formats[j]).length);
                    }
                    var x = arr.length,
                        nv = 17;
                    for (var k in temp) {
                        var stick = Math.round(temp[k] * nv / x);
                        res += formats[k] + ":\n" + Array(stick + 1).join("■") + Array(nv - stick + 1).join("□") + "\n";
                    }
                    //console.log(findElement(arr,"Модерн"));
                    if (command=="/showp")
                    {
                        bot.sendMessage(id, res,{"parse_mode": "Markdown"});
                    }
                    if ( command=="/showv") {
                        bot.sendMessage(id, tex, {"parse_mode": "Markdown"});
                    }
                    if ( command=="global")
                    {
                        bot.sendMessage(id, res+"\n"+tex,{"parse_mode": "Markdown"});
                        var ix = getMaxID(temp);
                        switch(arr[ix]){
                            case 'Модерн':
                                bot.sendMessage(id,Random.pick(swear.modern));
                                break;
                            case 'Двухголовый Гигант':
                                bot.sendMessage(id,Random.pick(swear.twohg));
                                break;
                            case 'Паупер':
                                bot.sendMessage(id,Random.pick(swear.pauper));
                                break;
                            case 'Меня не будет':
                                bot.sendMessage(id,Random.pick(swear.elses));
                                break;
                            case 'Приду, но не буду играть':
                                bot.sendMessage(id,Random.pick(swear.elses));
                                break;
                            default:
                                bot.sendMessage(id,Random.pick(swear.split));
                        }


                    }
                    //console.log(res);
                }
                else{
                    console.log("empty list");
                    bot.sendMessage(id, "Ты б сначала проголосовал\nесли можешь, "+Random.pick(swear.noun)+" "+Random.pick(swear.adjective)+"!");
                }
            }
        }
    );
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

bot.on('message', function(msg){
    if (msg.from.id == MyChatID)
    {
        if (msg.text == '/startpoll')
        {
            startPoll(MyChatID);
        }
        if (msg.text == '/test')
        {
            bot.sendMessage(MyChatID,"*Работаю я, не видишь?*",{"parse_mode": "Markdown"});
        }
        if (msg.text =='/pubres')
        {
            showResults(msg.from.id,'global');
        }
    }
    if (msg.text == '/showp' || msg.text == '/showp@rude_mtg_bot')
    {
        showResults(msg.chat.id,'/showp');
    }
    if (msg.text == '/showv' || msg.text == '/showv@rude_mtg_bot')
    {
        showResults(msg.chat.id,'/showv');
    }
    if (msg.text == '/stealtv' || msg.text =='/stealtv@rude_mtg_bot')
    {
        bot.sendMessage(msg.chat.id,"*"+Random.pick(swear.stealTV)+"\nЯ тебя "+Random.pick(swear.chem)+" "+Random.pick(swear.will)+"!*",{"parse_mode": "Markdown"});

    }
    if (msg.text == '/help' || msg.text == '/help@rude_mtg_bot')
    {
        bot.sendMessage(msg.chat.id,
            "Rudebot v1.1.6\n" +
            "/help - отображение этого сообщения\n" +
            "/showp - отображение количества проголосовавших в процентном соотношении\n"+
            "/showv - отображение списка проголосовавших\n"+
            "/stealtv - украсть телик\n"+
            "[Наш канал в Telegram](https://t.me/kh_mtg_comm)\n"+
            "[Наша группа ВК](https://vk.com/mtg_comm_kh)",{"parse_mode": "Markdown"});
    }
});

bot.on('callback_query',function (msg) {
    var user_vote={};
    user_vote.user_id = msg.from.id;
    user_vote.time = getnow();
    user_vote.how_voted = msg.data;
    user_vote.name = msg.from.first_name+" "+msg.from.last_name;

    getQuery('SELECT * FROM voters WHERE time=(SELECT MAX(time) FROM voters WHERE user_id=0);',function(err,last_query_time) {
        if (err) {
            console.log("ERROR : ",err);
        }
        else {
            if ((moment()-moment(last_query_time[0].time))/1000<86400) {
                getQuery("SELECT MAX(time) FROM voters WHERE user_id = "+user_vote.user_id+";",
                    function(err,user_time) {
                        if (err) {
                            console.log("ERROR : ",err);
                        } else {
                            //console.log(if_exists);
                            if (user_time[0]['MAX(time)'] != null) {
                                console.log("User exists, "+user_vote.name+" vote for "+user_vote.how_voted+". Latest entry: "+user_time[0]['MAX(time)']);
                                //bot.sendMessage(MyChatID,"User exists, "+user_vote.name+" vote for "+user_vote.how_voted+". Latest entry: "+user_time[0]['MAX(time)']);
                                if (moment(last_query_time[0].time) > moment(user_time[0]['MAX(time)']))
                                {
                                    bot.answerCallbackQuery(msg.id, "Ах ты "+Random.pick(swear.noun)+" "+Random.pick(swear.adjective)+'!\n'+'Ты, '+Random.pick(swear.noun)+', выбрал '+user_vote.how_voted+', как последний '+Random.pick(swear.noun)+'.', true);
                                    getQuery("INSERT INTO voters VALUES ('"+user_vote.user_id+"','"+user_vote.time+"','"+user_vote.how_voted+"','"+user_vote.name+"');",
                                        function(err) {
                                            if (err) {
                                                console.log("ERROR : ",err);
                                            }
                                        }
                                    );
                                }
                                else {
                                    getQuery("SELECT how_voted FROM voters WHERE user_id="+user_vote.user_id+" AND time>'"+moment(last_query_time[0].time)+"' ORDER BY time DESC LIMIT 1;",
                                        function(err,res) {
                                            if (err) {
                                                console.log("ERROR : ",err);
                                            }
                                            else {
                                                bot.answerCallbackQuery(msg.id, 'Ты, '+Random.pick(swear.adjective)+' '+Random.pick(swear.noun)+'!\nЗабыл, что уже проголосовал?\n'+'И выбрал же, как '+Random.pick(swear.noun)+' - '+res[0].how_voted, true);
                                            }
                                        }
                                    );
                                }
                            }
                            else {
                                console.log("Signing in new user: "+user_vote.name);
                                getQuery("INSERT INTO voters VALUES ('"+user_vote.user_id+"','"+user_vote.time+"','"+user_vote.how_voted+"','"+user_vote.name+"');",
                                    function(err) {
                                        if (err) {
                                            console.log("ERROR : ",err);
                                        }
                                    }
                                );
                                bot.answerCallbackQuery(msg.id, "Ах ты "+Random.pick(swear.noun)+" "+Random.pick(swear.adjective)+'!\n'+'Ты, '+Random.pick(swear.noun)+', выбрал '+user_vote.how_voted+', как последний '+Random.pick(swear.noun)+'.', true);
                            }
                        }
                    }
                );
            }
            else {
                bot.answerCallbackQuery(msg.id, capitalize(Random.pick(swear.noun))+" "+Random.pick(swear.adjective)+'!\nВздумал ко мне лезть до начала следующего опроса?\nНу давай, иди сюда, '+Random.pick(swear.noun)+' '+Random.pick(swear.adjective)+'!', true);
            }
        }
    });

});

var job = new Cron ("00 00 * * * *",function() {
    request(url, function (error, response, body) {
        var data = JSON.parse(body);
        var prs = data.value.joke;
        bot.sendMessage(MyChatID, prs);
    });
});
var mtg_job = new Cron ("00 00 8 * * 3",function() {
    startPoll(MTGChannelID);
});
var results = new Cron ("00 00 8 * * 5",function() {
    showResults(MTGChannelID,'global');

});
//job.start();
mtg_job.start();
results.start();
