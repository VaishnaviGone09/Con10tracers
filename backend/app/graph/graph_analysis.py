"""
Graph Analysis
Uses NetworkX for graph metrics and analysis
"""

from typing import Dict, List, Any
import logging

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False
    logging.warning("NetworkX not available - graph analysis will be limited")

from app.graph.neo4j_client import graph_client

logger = logging.getLogger(__name__)


class GraphAnalyzer:
    """Analyzes graph structure and calculates metrics"""
    
    def __init__(self):
        self.client = graph_client
    
    def _build_networkx_graph(self, nodes: List[Dict], edges: List[Dict]) -> Any:
        """Build a NetworkX graph from nodes and edges"""
        if not NETWORKX_AVAILABLE:
            return None
        
        G = nx.Graph()
        
        # Add nodes
        for node in nodes:
            G.add_node(node['id'], **node['properties'])
        
        # Add edges
        for edge in edges:
            G.add_edge(edge['source'], edge['target'], 
                      relationship_type=edge['relationship_type'],
                      **edge['properties'])
        
        return G
    
    def calculate_metrics(self, case_id: str) -> Dict[str, Any]:
        """Calculate graph metrics for a case"""
        graph_data = self.client.get_graph_data(case_id)
        nodes = graph_data.get('nodes', [])
        edges = graph_data.get('edges', [])
        
        if not NETWORKX_AVAILABLE:
            # Return basic metrics without NetworkX
            return {
                'degree_centrality': {},
                'betweenness_centrality': {},
                'pagerank': {},
                'communities': {},
                'node_count': len(nodes),
                'edge_count': len(edges),
                'warning': 'NetworkX not available - limited metrics'
            }
        
        G = self._build_networkx_graph(nodes, edges)
        
        if G.number_of_nodes() == 0:
            return {
                'degree_centrality': {},
                'betweenness_centrality': {},
                'pagerank': {},
                'communities': {},
                'node_count': 0,
                'edge_count': 0
            }
        
        metrics = {}
        
        # Degree centrality
        try:
            degree_centrality = nx.degree_centrality(G)
            metrics['degree_centrality'] = {str(k): v for k, v in degree_centrality.items()}
        except Exception as e:
            logger.error(f"Error calculating degree centrality: {e}")
            metrics['degree_centrality'] = {}
        
        # Betweenness centrality
        try:
            betweenness = nx.betweenness_centrality(G)
            metrics['betweenness_centrality'] = {str(k): v for k, v in betweenness.items()}
        except Exception as e:
            logger.error(f"Error calculating betweenness centrality: {e}")
            metrics['betweenness_centrality'] = {}
        
        # PageRank
        try:
            pagerank = nx.pagerank(G)
            metrics['pagerank'] = {str(k): v for k, v in pagerank.items()}
        except Exception as e:
            logger.error(f"Error calculating PageRank: {e}")
            metrics['pagerank'] = {}
        
        # Community detection
        try:
            communities = nx.community.greedy_modularity_communities(G)
            community_dict = {}
            for i, community in enumerate(communities):
                for node in community:
                    community_dict[str(node)] = i
            metrics['communities'] = community_dict
        except Exception as e:
            logger.error(f"Error detecting communities: {e}")
            metrics['communities'] = {}
        
        metrics['node_count'] = G.number_of_nodes()
        metrics['edge_count'] = G.number_of_edges()
        
        return metrics
    
    def find_shortest_path(self, case_id: str, source: str, target: str) -> List[str]:
        """Find shortest path between two nodes"""
        if not NETWORKX_AVAILABLE:
            return self.client.find_path(source, target)
        
        graph_data = self.client.get_graph_data(case_id)
        G = self._build_networkx_graph(graph_data['nodes'], graph_data['edges'])
        
        if G is None or source not in G or target not in G:
            return []
        
        try:
            path = nx.shortest_path(G, source, target)
            return path
        except nx.NetworkXNoPath:
            return []
        except Exception as e:
            logger.error(f"Error finding shortest path: {e}")
            return []
    
    def get_node_importance(self, case_id: str, node_id: str) -> Dict[str, float]:
        """Get importance metrics for a specific node"""
        metrics = self.calculate_metrics(case_id)
        
        return {
            'degree_centrality': metrics['degree_centrality'].get(node_id, 0.0),
            'betweenness_centrality': metrics['betweenness_centrality'].get(node_id, 0.0),
            'pagerank': metrics['pagerank'].get(node_id, 0.0),
            'community': metrics['communities'].get(node_id, -1)
        }
    
    def get_high_importance_nodes(self, case_id: str, threshold: float = 0.5) -> List[str]:
        """Get nodes with importance above threshold"""
        metrics = self.calculate_metrics(case_id)
        
        high_importance = set()
        
        for node_id, centrality in metrics['degree_centrality'].items():
            if centrality >= threshold:
                high_importance.add(node_id)
        
        for node_id, pagerank in metrics['pagerank'].items():
            if pagerank >= threshold:
                high_importance.add(node_id)
        
        return list(high_importance)


# Global graph analyzer instance
graph_analyzer = GraphAnalyzer()
