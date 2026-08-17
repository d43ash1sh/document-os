import { db } from '../database/db';
import type { BusinessDocument, DocumentRevision } from '../../types';

export const RevisionRepository = {
  async getByDocumentId(documentId: string): Promise<DocumentRevision[]> {
    return await db.revisions
      .where('documentId')
      .equals(documentId)
      .sortBy('revisionNumber');
  },

  async createRevision(document: BusinessDocument, note = 'Document update'): Promise<DocumentRevision> {
    const existingRevisions = await this.getByDocumentId(document.id);
    const nextRevNumber = existingRevisions.length + 1;

    const revision: DocumentRevision = {
      id: 'rev_' + crypto.randomUUID(),
      documentId: document.id,
      revisionNumber: nextRevNumber,
      documentSnapshot: JSON.parse(JSON.stringify(document)),
      note,
      createdAt: new Date().toISOString()
    };

    await db.revisions.add(revision);
    return revision;
  }
};
