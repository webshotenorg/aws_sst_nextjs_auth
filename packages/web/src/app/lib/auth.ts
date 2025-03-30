import { jwtVerify } from "jose";

export async function verifyToken(token: string) {
    const jwksUrl =
        `https://${process.env.COGNITO_DOMAIN}.auth.${process.env.AWS_REGION}.amazoncognito.com/.well-known/jwks.json`;

    const { payload } = await jwtVerify(token, async (header) => {
        const res = await fetch(jwksUrl);
        const { keys } = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return keys.find((k: any) => k.kid === header.kid);
    }, {
        issuer:
            `https://${process.env.COGNITO_DOMAIN}.auth.${process.env.AWS_REGION}.amazoncognito.com/${process.env.COGNITO_USER_POOL_ID}`,
    });

    return payload;
}
