import { Router } from "express";
import { taxonomyController } from "../controllers/taxonomyController";
import { validate } from "../config/middleware/validateMiddleware";
import { authenticate } from "../config/middleware/authMiddleware";
import { authorize } from "../config/middleware/authorizeMiddleware";
import {
  idParamSchema,
  statusSchema,
  createUniversitySchema,
  updateUniversitySchema,
  createFacultySchema,
  updateFacultySchema,
  listFacultiesQuerySchema,
  createProgrammeSchema,
  updateProgrammeSchema,
  listProgrammesQuerySchema,
  createSubjectSchema,
  updateSubjectSchema,
} from "../validators/taxonomyValidators";

const router = Router();

// Every write route below requires authenticate + authorize('ADMIN').
// Read routes require authenticate (any logged-in role) — this app has
// no anonymous/public browsing yet, so there is no reason to expose
// taxonomy data to unauthenticated requests.

/**
 * @openapi
 * /taxonomy/universities:
 *   get:
 *     tags: [Taxonomy]
 *     summary: List universities
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of universities }
 *   post:
 *     tags: [Taxonomy]
 *     summary: Create a university (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       403: { description: Not an admin }
 */
router.get("/universities", authenticate, taxonomyController.listUniversities);
router.post(
  "/universities",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createUniversitySchema }),
  taxonomyController.createUniversity,
);
router.put(
  "/universities/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateUniversitySchema }),
  taxonomyController.updateUniversity,
);
router.patch(
  "/universities/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: statusSchema }),
  taxonomyController.setUniversityStatus,
);

/**
 * @openapi
 * /taxonomy/faculties:
 *   get:
 *     tags: [Taxonomy]
 *     summary: List faculties for a university
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: universityId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of faculties }
 */
router.get(
  "/faculties",
  authenticate,
  validate({ query: listFacultiesQuerySchema }),
  taxonomyController.listFaculties,
);
router.post(
  "/faculties",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createFacultySchema }),
  taxonomyController.createFaculty,
);
router.put(
  "/faculties/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateFacultySchema }),
  taxonomyController.updateFaculty,
);
router.patch(
  "/faculties/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: statusSchema }),
  taxonomyController.setFacultyStatus,
);

/**
 * @openapi
 * /taxonomy/programmes:
 *   get:
 *     tags: [Taxonomy]
 *     summary: List programmes for a faculty
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: facultyId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of programmes }
 */
router.get(
  "/programmes",
  authenticate,
  validate({ query: listProgrammesQuerySchema }),
  taxonomyController.listProgrammes,
);
router.post(
  "/programmes",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createProgrammeSchema }),
  taxonomyController.createProgramme,
);
router.put(
  "/programmes/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateProgrammeSchema }),
  taxonomyController.updateProgramme,
);
router.patch(
  "/programmes/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: statusSchema }),
  taxonomyController.setProgrammeStatus,
);

/**
 * @openapi
 * /taxonomy/subjects:
 *   get:
 *     tags: [Taxonomy]
 *     summary: List subjects
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of subjects }
 */
router.get("/subjects", authenticate, taxonomyController.listSubjects);
router.post(
  "/subjects",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createSubjectSchema }),
  taxonomyController.createSubject,
);
router.put(
  "/subjects/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: updateSubjectSchema }),
  taxonomyController.updateSubject,
);
router.patch(
  "/subjects/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ params: idParamSchema, body: statusSchema }),
  taxonomyController.setSubjectStatus,
);

export default router;
