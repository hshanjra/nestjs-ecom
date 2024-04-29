// mongo-session.store.ts
import { Injectable } from '@nestjs/common';
import { Store } from 'express-session';
import { Model, Connection, Schema } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { SessionData } from 'express-session';

interface SessionDocument {
  _id: string;
  session: string;
}

@Injectable()
export class MongoSessionStore extends Store {
  private sessionModel: Model<SessionDocument>;

  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
    this.sessionModel = this.connection.model<SessionDocument>(
      'Session',
      new Schema({
        _id: String,
        session: String,
      }),
    );
  }

  async get(
    sid: string,
    callback: (err: any, session?: SessionData | null) => void,
  ): Promise<void> {
    try {
      const sessionDoc = await this.sessionModel.findById(sid).exec();
      if (sessionDoc) {
        callback(null, JSON.parse(sessionDoc.session));
      } else {
        callback(null, null);
      }
    } catch (error) {
      callback(error);
    }
  }

  async set(
    sid: string,
    session: SessionData,
    callback?: (err?: any) => void,
  ): Promise<void> {
    try {
      const sessionJson = JSON.stringify(session);
      await this.sessionModel
        .updateOne(
          { _id: sid },
          { _id: sid, session: sessionJson },
          { upsert: true },
        )
        .exec();
      if (callback) callback();
    } catch (error) {
      if (callback) callback(error);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await this.sessionModel.deleteOne({ _id: sid }).exec();
      if (callback) callback();
    } catch (error) {
      if (callback) callback(error);
    }
  }
}
