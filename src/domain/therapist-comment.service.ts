import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TherapistComment } from 'src/comment/therapist-comment.entity';
import { Association } from 'src/association/entity';
import { Therapist } from 'src/therapist/entity';

@Injectable()
export class TherapistCommentService {
  constructor(
    @InjectRepository(TherapistComment)
    private readonly commentRepo: Repository<TherapistComment>,
    @InjectRepository(Association)
    private readonly associationRepo: Repository<Association>,
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
  ) {}

  private async getAssociationAndVerifyOwnership(
    associationId: string,
    therapistKeycloakId: string,
  ): Promise<Association> {
    const association = await this.associationRepo.findOne({
      where: { id: associationId },
      relations: { therapist: true },
    });
    if (!association) throw new NotFoundException('Association not found');
    if (association.therapist?.keycloakId !== therapistKeycloakId) {
      throw new ForbiddenException('Not your association');
    }
    return association;
  }

  private async getCommentAndVerifyOwnership(
    commentId: string,
    therapistKeycloakId: string,
  ): Promise<TherapistComment> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: { association: { therapist: true } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (
      comment.association?.therapist?.keycloakId !== therapistKeycloakId
    ) {
      throw new ForbiddenException('You do not own this comment');
    }
    return comment;
  }

  async createForAssociation(params: {
    associationId: string;
    therapistKeycloakId: string;
    text: string;
  }): Promise<TherapistComment> {
    const { associationId, therapistKeycloakId, text } = params;

    const association = await this.getAssociationAndVerifyOwnership(
      associationId,
      therapistKeycloakId,
    );

    const entity = this.commentRepo.create({
      text,
      association,
    });
    return await this.commentRepo.save(entity);
  }

  async listForAssociation(params: {
    associationId: string;
    therapistKeycloakId: string;
  }): Promise<TherapistComment[]> {
    const { associationId, therapistKeycloakId } = params;

    await this.getAssociationAndVerifyOwnership(
      associationId,
      therapistKeycloakId,
    );

    return this.commentRepo.find({
      where: { association: { id: associationId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(params: {
    commentId: string;
    therapistKeycloakId: string;
    text: string;
  }): Promise<TherapistComment> {
    const { commentId, therapistKeycloakId, text } = params;

    // Get comment and verify ownership in one go
    const comment = await this.getCommentAndVerifyOwnership(
      commentId,
      therapistKeycloakId,
    );

    comment.text = text;
    return await this.commentRepo.save(comment);
  }

  async remove(params: {
    commentId: string;
    therapistKeycloakId: string;
  }): Promise<void> {
    const { commentId, therapistKeycloakId } = params;

    const comment = await this.getCommentAndVerifyOwnership(
      commentId,
      therapistKeycloakId,
    );

    await this.commentRepo.remove(comment);
  }

}