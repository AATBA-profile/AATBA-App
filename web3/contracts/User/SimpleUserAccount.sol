// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;


import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {SubProfileFactory} from "../SubProfile/SubProfileFactory.sol";
import {SubProfileTemplateRegistry} from "../SubProfile/SubProfileTemplateRegistry.sol";

contract SimpleUserAccount is IERC721Receiver {

    //SubProfileFactory contract instance
    SubProfileFactory immutable subProfileFactory;

    //SubProfileTemplateRegistry contract instance
    SubProfileTemplateRegistry immutable subProfileTemplateRegistry;

    //the address of user owning the account
    address immutable _user;
    
    //array of tokenIds of subProfiles at specific index of subProfileTemplateRegistry
    uint256[] private subprofilesTokenIds;

    event SubProfileCreated(address indexed subProfileAddress, uint256 indexed tokenId);

    event ReceivedERC721(address indexed operator, address indexed from, uint256 indexed tokenId, bytes data);

    event SubProfileAdded(address indexed userAccount, address indexed subProfile, uint256 indexed tokenId);

    constructor(address _subProfileFactory, address user_) {
        subProfileFactory = SubProfileFactory(_subProfileFactory);
        subProfileTemplateRegistry = SubProfileTemplateRegistry(subProfileFactory.subProfileTemplateRegistryAddress());
        _user = user_;
        for(uint256 i = 0; i < subProfileTemplateRegistry.registryLength(); i++){
            subprofilesTokenIds.push(0);
        }
    }

    //TODO add verification of the subProfileFactory if registered subProfile
    /**
     * @dev See {IERC721Receiver-onERC721Received}.
     * @notice The contract address MUST be a verified subProfile registered in the subProfileFactory
     * @param operator address of the operator
     * @param from address of the user
     * @param tokenId id of the subProfile
     * @param data additional data
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        external 
        returns (bytes4)
    {
        emit ReceivedERC721(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @notice create a subProfile NFt linked to a subProfileTBA for the user
     * @param index index of the subProfileTemplate in the subProfileTemplateRegistry
     * @return subProfileTbaAddress address of the subProfileTBA
     * @return tokenId tokenId of the subProfileNFT linked to the subProfileTBA
     */
    function createSubProfile(uint256 index) external returns(address subProfileTbaAddress, uint256 tokenId){
        require(msg.sender == _user, "only user can create subProfile");
        _verifyRegistryLengthOrFix();

        (address subProfileTemplateAddress, , ) = subProfileTemplateRegistry.getSubProfileTemplate(index);
        (subProfileTbaAddress, tokenId) = subProfileFactory.createSubProfileForUser(msg.sender, subProfileTemplateAddress);
        subprofilesTokenIds[index] = tokenId;
        emit SubProfileAdded(address(this), subProfileTbaAddress, tokenId);
    }

    /**
     * @notice get the subProfileTBA and tokenId of a subProfile
     * @param index index of the subProfileTemplate in the subProfileTemplateRegistry
     * @return subProfileTemplateAddress address of the subProfileTemplate
     * @return name name of the subProfileTemplate
     * @return tokenId tokenId of the subProfileNFT linked to the subProfileTBA
     * @return subProfileAddress address of the subProfileTBA linked to NFT of tokenId of subProfileTemplate at index in subProfileTemplateRegistry
     */
    function getSubProfile(uint256 index) external view returns(address subProfileTemplateAddress,string memory name, uint256 tokenId, address subProfileAddress){
        (subProfileTemplateAddress, , name) = subProfileTemplateRegistry.getSubProfileTemplate(index);
        require(index < subprofilesTokenIds.length, "index out of bounds");
        tokenId = subprofilesTokenIds[index];
        require(tokenId != 0, "subProfile does not exist");
        subProfileAddress = subProfileFactory.tbaAccount(index, tokenId);
    }

    /**
     * @notice verifies the length of the subProfileTemplateRegistry and fixes the subprofilesTokenIds array length if needed
     */
    function _verifyRegistryLengthOrFix() internal {
        if(subprofilesTokenIds.length < subProfileTemplateRegistry.registryLength()){
            for(uint256 i = subprofilesTokenIds.length; i < subProfileTemplateRegistry.registryLength(); i++){
                subprofilesTokenIds.push(0);
            }
        }
    }

    function getTokenId(uint256 index) external view returns(uint256 tokenId){
        tokenId = subprofilesTokenIds[index];
    }

    function subProfileFactoryAddress() external view returns(address){
        return address(subProfileFactory);
    }

    function subProfileTemplateRegistryAddress() external view returns(address){
        return address(subProfileTemplateRegistry);
    }

    function user() external view returns(address){
        return _user;
    }
}