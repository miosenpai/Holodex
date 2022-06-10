
/**
 * Shamelessly copied from LanguageUtils.js of i18next.
 * 
 * Slightly adapted for typescript
 */


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export class LanguageUtil {
    options: { supportedLngs: string[]; lowerCaseLng?: false; cleanCode?: false; load?: string; nonExplicitSupportedLngs: boolean; fallbackLng: string[]; };
    supportedLngs: any;
    constructor(options: { supportedLngs: string[]; lowerCaseLng?: false; cleanCode?: false; load?: string; nonExplicitSupportedLngs: boolean; fallbackLng: string[]; }) {
        this.options = options;

        this.supportedLngs = this.options.supportedLngs || false;
    }

    getScriptPartFromCode(code) {
        if (!code || code.indexOf('-') < 0) return null;

        const p = code.split('-');
        if (p.length === 2) return null;
        p.pop();
        if (p[p.length - 1].toLowerCase() === 'x') return null;
        return this.formatLanguageCode(p.join('-'));
    }

    getLanguagePartFromCode(code) {
        if (!code || code.indexOf('-') < 0) return code;

        const p = code.split('-');
        return this.formatLanguageCode(p[0]);
    }

    formatLanguageCode(code) {
        // http://www.iana.org/assignments/language-tags/language-tags.xhtml
        if (typeof code === 'string' && code.indexOf('-') > -1) {
            const specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab'];
            let p = code.split('-');

            if (this.options.lowerCaseLng) {
                p = p.map((part) => part.toLowerCase());
            } else if (p.length === 2) {
                p[0] = p[0].toLowerCase();
                p[1] = p[1].toUpperCase();

                if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
            } else if (p.length === 3) {
                p[0] = p[0].toLowerCase();

                // if lenght 2 guess it's a country
                if (p[1].length === 2) p[1] = p[1].toUpperCase();
                if (p[0] !== 'sgn' && p[2].length === 2) p[2] = p[2].toUpperCase();

                if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
                if (specialCases.indexOf(p[2].toLowerCase()) > -1) p[2] = capitalize(p[2].toLowerCase());
            }

            return p.join('-');
        }

        return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
    }

    isSupportedCode(code) {
        if (this.options.load === 'languageOnly' || this.options.nonExplicitSupportedLngs) {
            code = this.getLanguagePartFromCode(code);
        }
        return (
            !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1
        );
    }

    getBestMatchFromCodes(codes?: string[]): string | null | undefined {
        if (!codes) return null;

        let found: string;

        // pick first supported code or if no restriction pick the first one (highest prio)
        codes.forEach((code) => {
            if (found) return;
            let cleanedLng = this.formatLanguageCode(code);
            if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
        });

        // if we got no match in supportedLngs yet - check for similar locales
        // first  de-CH --> de
        // second de-CH --> de-DE
        if (!found && this.options.supportedLngs) {
            codes.forEach((code) => {
                if (found) return;

                let lngOnly = this.getLanguagePartFromCode(code);
                if (this.isSupportedCode(lngOnly)) return (found = lngOnly);

                found = this.options.supportedLngs.find((supportedLng) => {
                    if (supportedLng.indexOf(lngOnly) === 0) return supportedLng;
                });
            });
        }

        // if nothing found, use fallbackLng
        if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];

        return found;
    }

    getFallbackCodes(fallbacks: string[], code?: string | number) {
        return fallbacks;
    }

    toResolveHierarchy(code, fallbackCode) {
        const fallbackCodes = this.getFallbackCodes(
            fallbackCode || this.options.fallbackLng || [],
            code,
        );

        const codes = [];
        const addCode = (c) => {
            if (!c) return;
            if (this.isSupportedCode(c)) {
                codes.push(c);
            } else {
                console.warn(`rejecting language code not found in supportedLngs: ${c}`);
            }
        };

        if (typeof code === 'string' && code.indexOf('-') > -1) {
            if (this.options.load !== 'languageOnly') addCode(this.formatLanguageCode(code));
            if (this.options.load !== 'languageOnly' && this.options.load !== 'currentOnly')
                addCode(this.getScriptPartFromCode(code));
            if (this.options.load !== 'currentOnly') addCode(this.getLanguagePartFromCode(code));
        } else if (typeof code === 'string') {
            addCode(this.formatLanguageCode(code));
        }

        fallbackCodes.forEach((fc) => {
            if (codes.indexOf(fc) < 0) addCode(this.formatLanguageCode(fc));
        });

        return codes;
    }
}