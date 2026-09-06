import {
  taxonomyModel,
  toApiUniversity,
  toApiFaculty,
  toApiProgramme,
  toApiSubject,
} from "../models/taxonomyModel";
import { auditLogModel } from "../models/auditLogModel";
import { slugify } from "../utils/slug";
import { AppError } from "../types/errors";

interface ActorContext {
  actorUserId: string;
  requestId?: string;
  ipAddress?: string;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "23505"
  );
}

export const taxonomyService = {
  universities: {
    async list() {
      const rows = await taxonomyModel.universities.list();
      return rows.map(toApiUniversity);
    },

    async create(input: { name: string; country?: string }, ctx: ActorContext) {
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.universities.create({
          name: input.name,
          slug,
          country: input.country ?? "Malaysia",
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "A university with this name already exists.",
          );
        throw err;
      }
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_UNIVERSITY_CREATED",
        targetType: "university",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiUniversity(row);
    },

    async update(
      id: string,
      input: { name: string; country?: string },
      ctx: ActorContext,
    ) {
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.universities.update(id, {
          name: input.name,
          slug,
          country: input.country ?? "Malaysia",
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "A university with this name already exists.",
          );
        throw err;
      }
      if (!row) throw AppError.notFound("University not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_UNIVERSITY_UPDATED",
        targetType: "university",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiUniversity(row);
    },

    async setActive(id: string, isActive: boolean, ctx: ActorContext) {
      const row = await taxonomyModel.universities.setActive(id, isActive);
      if (!row) throw AppError.notFound("University not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: isActive
          ? "TAXONOMY_UNIVERSITY_RESTORED"
          : "TAXONOMY_UNIVERSITY_ARCHIVED",
        targetType: "university",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiUniversity(row);
    },
  },

  faculties: {
    async listByUniversity(universityId: string) {
      const university =
        await taxonomyModel.universities.findById(universityId);
      if (!university) throw AppError.badRequest("University not found.");
      const rows = await taxonomyModel.faculties.listByUniversity(universityId);
      return rows.map(toApiFaculty);
    },

    async create(
      input: { universityId: string; name: string },
      ctx: ActorContext,
    ) {
      const university = await taxonomyModel.universities.findById(
        input.universityId,
      );
      if (!university || !university.is_active) {
        throw AppError.badRequest("University not found or inactive.");
      }
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.faculties.create({
          universityId: input.universityId,
          name: input.name,
          slug,
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "This faculty already exists for that university.",
          );
        throw err;
      }
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_FACULTY_CREATED",
        targetType: "faculty",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiFaculty(row);
    },

    async update(id: string, input: { name: string }, ctx: ActorContext) {
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.faculties.update(id, {
          name: input.name,
          slug,
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "This faculty already exists for that university.",
          );
        throw err;
      }
      if (!row) throw AppError.notFound("Faculty not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_FACULTY_UPDATED",
        targetType: "faculty",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiFaculty(row);
    },

    async setActive(id: string, isActive: boolean, ctx: ActorContext) {
      const row = await taxonomyModel.faculties.setActive(id, isActive);
      if (!row) throw AppError.notFound("Faculty not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: isActive
          ? "TAXONOMY_FACULTY_RESTORED"
          : "TAXONOMY_FACULTY_ARCHIVED",
        targetType: "faculty",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiFaculty(row);
    },
  },

  programmes: {
    async listByFaculty(facultyId: string) {
      const rows = await taxonomyModel.programmes.listByFaculty(facultyId);
      return rows.map(toApiProgramme);
    },

    async create(
      input: { facultyId: string; name: string; studyLevel?: string },
      ctx: ActorContext,
    ) {
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.programmes.create({
          facultyId: input.facultyId,
          name: input.name,
          slug,
          studyLevel: input.studyLevel ?? null,
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "This programme already exists for that faculty.",
          );
        // A missing/invalid facultyId trips the foreign key, not the unique index.
        if (
          typeof err === "object" &&
          err !== null &&
          (err as { code?: string }).code === "23503"
        ) {
          throw AppError.badRequest("Faculty not found.");
        }
        throw err;
      }
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_PROGRAMME_CREATED",
        targetType: "programme",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiProgramme(row);
    },

    async update(
      id: string,
      input: { name: string; studyLevel?: string },
      ctx: ActorContext,
    ) {
      const slug = slugify(input.name);
      let row;
      try {
        row = await taxonomyModel.programmes.update(id, {
          name: input.name,
          slug,
          studyLevel: input.studyLevel ?? null,
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict(
            "This programme already exists for that faculty.",
          );
        throw err;
      }
      if (!row) throw AppError.notFound("Programme not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_PROGRAMME_UPDATED",
        targetType: "programme",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiProgramme(row);
    },

    async setActive(id: string, isActive: boolean, ctx: ActorContext) {
      const row = await taxonomyModel.programmes.setActive(id, isActive);
      if (!row) throw AppError.notFound("Programme not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: isActive
          ? "TAXONOMY_PROGRAMME_RESTORED"
          : "TAXONOMY_PROGRAMME_ARCHIVED",
        targetType: "programme",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiProgramme(row);
    },
  },

  subjects: {
    async list() {
      const rows = await taxonomyModel.subjects.list();
      return rows.map(toApiSubject);
    },

    async create(input: { code: string; name: string }, ctx: ActorContext) {
      let row;
      try {
        row = await taxonomyModel.subjects.create({
          code: input.code,
          name: input.name,
        });
      } catch (err) {
        if (isUniqueViolation(err))
          throw AppError.conflict("A subject with this code already exists.");
        throw err;
      }
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_SUBJECT_CREATED",
        targetType: "subject",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiSubject(row);
    },

    async update(id: string, input: { name: string }, ctx: ActorContext) {
      const row = await taxonomyModel.subjects.update(id, { name: input.name });
      if (!row) throw AppError.notFound("Subject not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "TAXONOMY_SUBJECT_UPDATED",
        targetType: "subject",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiSubject(row);
    },

    async setActive(id: string, isActive: boolean, ctx: ActorContext) {
      const row = await taxonomyModel.subjects.setActive(id, isActive);
      if (!row) throw AppError.notFound("Subject not found.");
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: isActive
          ? "TAXONOMY_SUBJECT_RESTORED"
          : "TAXONOMY_SUBJECT_ARCHIVED",
        targetType: "subject",
        targetId: row.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
      return toApiSubject(row);
    },
  },
};
