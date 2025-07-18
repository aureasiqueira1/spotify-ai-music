export class User {
  constructor(
    public id: string,
    public displayName: string,
    public email: string,
    public spotifyId: string,
    public accessToken: string,
    public refreshToken: string,
    public tokenExpiresAt: number,
    public profileImage?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  isTokenExpired(): boolean {
    return Date.now() > this.tokenExpiresAt;
  }

  updateTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
    this.updatedAt = new Date();
  }

  static fromSpotifyUser(spotifyUser: any, tokens: any): User {
    return new User(
      spotifyUser.id,
      spotifyUser.display_name,
      spotifyUser.email,
      spotifyUser.id,
      tokens.access_token,
      tokens.refresh_token,
      Date.now() + tokens.expires_in * 1000,
      spotifyUser.images?.[0]?.url,
      new Date(),
      new Date()
    );
  }
}
