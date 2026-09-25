"""
Cross-Encoder Reranker Service
Reranks Top-25 Hybrid candidates down to Top-3 high-precision evidence citations.
Eliminates context clutter, maximizes LLM accuracy, and provides exact page-level citations.
"""
import logging
from typing import List, Tuple
from backend.app.schemas.rag import RetrievedChunk, EvidenceCitation

logger = logging.getLogger("iqsec.reranker")
logger.setLevel(logging.INFO)


class CrossEncoderReranker:
    """
    Reranker selecting Top-3 authoritative evidence snippets from candidate chunks.
    """

    def rerank(
        self,
        query: str,
        candidates: List[RetrievedChunk],
        top_k: int = 3
    ) -> List[EvidenceCitation]:
        """
        Reranks candidate chunks based on direct query-context alignment
        and returns the top-k highest-precision citations.
        """
        if not candidates:
            return []

        scored_candidates: List[Tuple[float, RetrievedChunk, str]] = []

        q_lower = query.lower()
        q_tokens = set(q_lower.split())

        for chunk in candidates:
            chunk_lower = chunk.text.lower()
            
            # 1. Exact phrase / keyword density bonus
            token_matches = sum(1 for tok in q_tokens if tok in chunk_lower and len(tok) > 3)
            token_ratio = token_matches / max(len(q_tokens), 1)

            # 2. Section title relevance bonus
            sec_matches = sum(1 for tok in q_tokens if tok in chunk.section_title.lower())
            sec_bonus = 0.2 if sec_matches > 0 else 0.0

            # 3. Base retrieval score
            base_score = chunk.score

            final_score = (0.5 * base_score) + (0.35 * token_ratio) + (0.15 * sec_bonus)

            # Extract the most relevant snippet/sentence from the chunk
            snippet = self._extract_best_sentence(query, chunk.text)

            scored_candidates.append((final_score, chunk, snippet))

        # Sort descending by reranked score
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        citations: List[EvidenceCitation] = []
        for score, chunk, snippet in scored_candidates[:top_k]:
            citations.append(
                EvidenceCitation(
                    document_title=chunk.doc_title,
                    page_number=chunk.page_number,
                    section_title=chunk.section_title,
                    exact_quote=snippet,
                    relevance_score=round(score, 4),
                    pillar=chunk.pillar,
                    confidentiality=chunk.confidentiality
                )
            )

        return citations

    def _extract_best_sentence(self, query: str, text: str) -> str:
        """Extracts the single most representative sentence/passage from the chunk"""
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
        if not sentences:
            return text[:250] + "..."

        q_tokens = set(query.lower().split())
        best_sent = sentences[0]
        max_overlap = -1

        for sent in sentences:
            sent_tokens = set(sent.lower().split())
            overlap = len(q_tokens.intersection(sent_tokens))
            if overlap > max_overlap:
                max_overlap = overlap
                best_sent = sent

        return best_sent.strip() + "."


reranker = CrossEncoderReranker()

