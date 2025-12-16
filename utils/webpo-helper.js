import { BG } from 'bgutils-js';
import { JSDOM } from 'jsdom';

export async function generateWebPoToken(contentBinding) {
    const requestKey = 'O43z0dpjhgX20SCx4KAo';

    if (!contentBinding)
        throw new Error('Could NotGget Visitor Data');

    const dom = new JSDOM();
    Object.assign(globalThis, {
        window: dom.window,
        document: dom.window.document
    });

    const bgConfig = {
        fetch: (input, init) => fetch(input, init),
        globalObj: globalThis,
        identifier: contentBinding,
        requestKey
    };

    const bgChallenge = await BG.Challenge.create(bgConfig);

    if (!bgChallenge)
        throw new Error('Could Not Get Challenge');

    const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;

    if (interpreterJavascript) {
        new Function(interpreterJavascript)();
    } else throw new Error('Could Not Load VM');

    const poTokenResult = await BG.PoToken.generate({
        program: bgChallenge.program,
        globalName: bgChallenge.globalName,
        bgConfig
    });

    const placeholderPoToken = BG.PoToken.generatePlaceholder(contentBinding);

    return {
        visitorData: contentBinding,
        placeholderPoToken,
        poToken: poTokenResult.poToken,
    };
}